import { createFileRoute } from "@tanstack/react-router";

const hex = (b: ArrayBuffer) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

async function handle(request: Request): Promise<Response> {
  // ALWAYS answer 200 so CPAGrip never retries, whatever happens below.
  try {
    const url = new URL(request.url);
    const subid = url.searchParams.get("subid") ?? "";
    const payout = parseFloat(url.searchParams.get("payout") ?? "0") || 0;
    const txid = url.searchParams.get("txid") ?? "";

    if (!subid && !txid) return new Response("ok", { status: 200 });

    // subid = <source>_<variant>_<clickid>. The click id is used verbatim.
    const parts = subid.split("_");
    const source = parts[0] ?? "direct";
    const variant = parts[1] || "unknown";
    const rawClickId = parts.slice(2).join("_");
    let clickId = rawClickId;
    try {
      clickId = decodeURIComponent(rawClickId);
    } catch {
      clickId = rawClickId;
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const conflictKey = txid || subid;
    await supabaseAdmin.from("conversions").upsert(
      {
        subid,
        source,
        page_variant: variant,
        payout,
        txid: conflictKey,
        status: "pending",
      },
      { onConflict: "txid" },
    );

    let status = "failed";

    if (source === "tb") {
      const secret = process.env["TIMEBUCKS_SECRET"];
      if (secret) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
        const sig = hex(
          await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(clickId)),
        );
        const r = await fetch(
          "https://webhooks.timebucks.com/taskapprove/?sessionid=" +
            encodeURIComponent(clickId) +
            "&signature=" +
            sig,
        );
        // 200 = credited, 409 = already credited (also success), 400/401 = failed.
        if (r.status === 200 || r.status === 409) status = "credited";
      } else {
        status = "pending";
      }
    } else if (source === "coin" || source === "fc") {
      const tpl =
        source === "coin"
          ? process.env["COINTIPLY_POSTBACK_TEMPLATE"]
          : process.env["FREECASH_POSTBACK_TEMPLATE"];
      if (tpl) {
        const r = await fetch(
          tpl
            .replaceAll("{clickid}", encodeURIComponent(clickId))
            .replaceAll("{payout}", String(payout)),
        );
        if (r.ok) status = "credited";
      } else {
        status = "pending";
      }
    }

    await supabaseAdmin.from("conversions").update({ status }).eq("txid", conflictKey);
  } catch (err) {
    console.error("postback-router error", err);
  }

  return new Response("ok", { status: 200 });
}

export const Route = createFileRoute("/api/public/postback-router")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
