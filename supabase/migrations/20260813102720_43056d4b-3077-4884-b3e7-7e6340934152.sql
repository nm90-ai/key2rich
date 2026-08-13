-- Ensure only the trusted server can write; clients get read-only (admin) access.
REVOKE ALL ON public.visits FROM anon, authenticated;
REVOKE ALL ON public.conversions FROM anon, authenticated;

GRANT SELECT ON public.visits TO authenticated;
GRANT SELECT ON public.conversions TO authenticated;
GRANT ALL ON public.visits TO service_role;
GRANT ALL ON public.conversions TO service_role;

-- Explicit deny of client-side writes (service_role bypasses RLS).
DROP POLICY IF EXISTS "No client inserts on visits" ON public.visits;
CREATE POLICY "No client inserts on visits" ON public.visits FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "No client updates on visits" ON public.visits;
CREATE POLICY "No client updates on visits" ON public.visits FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "No client deletes on visits" ON public.visits;
CREATE POLICY "No client deletes on visits" ON public.visits FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "No client inserts on conversions" ON public.conversions;
CREATE POLICY "No client inserts on conversions" ON public.conversions FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "No client updates on conversions" ON public.conversions;
CREATE POLICY "No client updates on conversions" ON public.conversions FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "No client deletes on conversions" ON public.conversions;
CREATE POLICY "No client deletes on conversions" ON public.conversions FOR DELETE TO anon, authenticated USING (false);