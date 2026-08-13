import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const visitSchema = z.object({
  click_id: z.string().max(500).nullable(),
  source: z.string().max(40),
  page_variant: z.string().max(40),
  subid: z.string().max(600),
});

/**
 * Records a landing page visit. Public on purpose (anonymous traffic),
 * writes happen server-side with the service role so the tables stay
 * unreadable/unwritable from the browser.
 */
export const recordVisit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => visitSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("visits")
      .upsert(
        {
          click_id: data.click_id,
          source: data.source,
          page_variant: data.page_variant,
          subid: data.subid,
        },
        { onConflict: "subid", ignoreDuplicates: true },
      );

    if (error) {
      console.error("recordVisit failed", error.message);
      return { ok: false };
    }
    return { ok: true };
  });
