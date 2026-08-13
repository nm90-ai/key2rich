CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id text,
  source text,
  page_variant text,
  subid text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subid text,
  source text,
  page_variant text,
  payout numeric,
  txid text UNIQUE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v_src ON public.visits(source);
CREATE INDEX IF NOT EXISTS idx_v_var ON public.visits(page_variant);
CREATE INDEX IF NOT EXISTS idx_c_src ON public.conversions(source);
CREATE INDEX IF NOT EXISTS idx_c_var ON public.conversions(page_variant);

GRANT ALL ON public.visits TO service_role;
GRANT ALL ON public.conversions TO service_role;
GRANT SELECT ON public.visits TO authenticated;
GRANT SELECT ON public.conversions TO authenticated;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT lower(email) = 'nayeemul1206@gmail.com' FROM auth.users WHERE id = auth.uid()),
    false
  );
$$;

CREATE POLICY "Admin can read visits" ON public.visits
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admin can read conversions" ON public.conversions
  FOR SELECT TO authenticated USING (public.is_admin());

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON public.visits FROM anon, authenticated;
REVOKE ALL ON public.conversions FROM anon, authenticated;

GRANT SELECT ON public.visits TO authenticated;
GRANT SELECT ON public.conversions TO authenticated;
GRANT ALL ON public.visits TO service_role;
GRANT ALL ON public.conversions TO service_role;

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