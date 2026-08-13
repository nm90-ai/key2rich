import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "nayeemul1206@gmail.com";

export type ConversionRow = {
  created_at: string;
  source: string | null;
  page_variant: string | null;
  subid: string | null;
  payout: number | null;
  status: string | null;
  txid: string | null;
};

export type GroupRow = {
  source: string;
  variant: string;
  visits: number;
  conversions: number;
  payout: number;
};

export type AdminStats = {
  visits: number;
  conversions: number;
  payout: number;
  groups: GroupRow[];
  recent: ConversionRow[];
};

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats> => {
    const email = (context.claims as { email?: string } | null)?.email ?? "";
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Forbidden");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: visits }, { data: conversions }] = await Promise.all([
      supabaseAdmin.from("visits").select("source, page_variant"),
      supabaseAdmin
        .from("conversions")
        .select("created_at, source, page_variant, subid, payout, status, txid")
        .order("created_at", { ascending: false }),
    ]);

    const visitRows = visits ?? [];
    const convRows = (conversions ?? []) as ConversionRow[];

    const map = new Map<string, GroupRow>();
    const keyOf = (s: string | null, v: string | null) =>
      `${s ?? "unknown"}|${v ?? "unknown"}`;
    const ensure = (s: string | null, v: string | null) => {
      const k = keyOf(s, v);
      let row = map.get(k);
      if (!row) {
        row = {
          source: s ?? "unknown",
          variant: v ?? "unknown",
          visits: 0,
          conversions: 0,
          payout: 0,
        };
        map.set(k, row);
      }
      return row;
    };

    for (const v of visitRows) ensure(v.source, v.page_variant).visits += 1;
    for (const c of convRows) {
      const row = ensure(c.source, c.page_variant);
      row.conversions += 1;
      if (c.status === "credited") row.payout += Number(c.payout ?? 0);
    }

    return {
      visits: visitRows.length,
      conversions: convRows.length,
      payout: convRows
        .filter((c) => c.status === "credited")
        .reduce((sum, c) => sum + Number(c.payout ?? 0), 0),
      groups: [...map.values()].sort(
        (a, b) => a.source.localeCompare(b.source) || a.variant.localeCompare(b.variant),
      ),
      recent: convRows.slice(0, 50),
    };
  });
