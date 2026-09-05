-- ==============================================================================
-- CrisisLink Production Security & Strict RLS Migration
-- Target: Supabase Cloud (nlpqlvcknpodvcukkddc.supabase.co)
-- Execute in: Supabase Dashboard → SQL Editor
-- Date: 2026-09-05
-- ==============================================================================

-- 1. INCIDENTS TABLE SECURITY
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Drop all old/permissive policies
DROP POLICY IF EXISTS "Public read published incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated read all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated write incidents" ON public.incidents;
DROP POLICY IF EXISTS "Incidents are viewable by everyone" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be created by authenticated users" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be updated by anyone" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be deleted by anyone" ON public.incidents;
DROP POLICY IF EXISTS "Anon insert incidents" ON public.incidents;
DROP POLICY IF EXISTS "Public read published incidents only" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated operators read all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Anon insert critical incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated operators update incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated operators delete incidents" ON public.incidents;

-- Strict Incident Policies:
-- A. Public & Anon can ONLY view incidents marked as publicly visible
CREATE POLICY "Public read published incidents only"
  ON public.incidents FOR SELECT
  USING (is_publicly_visible = true);

-- B. Authenticated Operators can read ALL incidents
CREATE POLICY "Authenticated operators read all incidents"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (true);

-- C. Anonymous users can INSERT incidents (for high-severity auto-escalated citizen reports)
CREATE POLICY "Anon insert critical incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (true);

-- D. ONLY Authenticated Operators can UPDATE incidents (Blocks unauthorized tampering)
CREATE POLICY "Authenticated operators update incidents"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- E. ONLY Authenticated Operators can DELETE incidents (Blocks arbitrary wipe attacks)
CREATE POLICY "Authenticated operators delete incidents"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (true);


-- 2. RESOURCES TABLE SECURITY
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated write resources" ON public.resources;
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Resources can be created by authenticated users" ON public.resources;
DROP POLICY IF EXISTS "Resources can be updated by anyone" ON public.resources;
DROP POLICY IF EXISTS "Resources can be deleted by anyone" ON public.resources;
DROP POLICY IF EXISTS "Public read resources fleet" ON public.resources;
DROP POLICY IF EXISTS "Authenticated operators write resources" ON public.resources;

-- Strict Resource Policies:
-- A. Read-only for public/anon
CREATE POLICY "Public read resources fleet"
  ON public.resources FOR SELECT
  USING (true);

-- B. ONLY Authenticated Operators can INSERT, UPDATE, or DELETE units
CREATE POLICY "Authenticated operators write resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- 3. CITIZEN REPORTS TABLE SECURITY (PII & HARVESTING DEFENSE)
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert citizen report" ON public.citizen_reports;
DROP POLICY IF EXISTS "Authenticated read reports" ON public.citizen_reports;
DROP POLICY IF EXISTS "Authenticated write reports" ON public.citizen_reports;
DROP POLICY IF EXISTS "Public read own report by token" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be created by anyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be updated by anyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be deleted by anyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Citizens submit reports" ON public.citizen_reports;
DROP POLICY IF EXISTS "Authenticated operators read all reports" ON public.citizen_reports;
DROP POLICY IF EXISTS "Authenticated operators update reports" ON public.citizen_reports;

-- Strict Citizen Report Policies:
-- A. Anyone (anonymous citizen) can INSERT reports
CREATE POLICY "Citizens submit reports"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (true);

-- B. ONLY Authenticated Operators can view the complete list of reports (Protects PII)
CREATE POLICY "Authenticated operators read all reports"
  ON public.citizen_reports FOR SELECT
  TO authenticated
  USING (true);

-- C. ONLY Authenticated Operators can triage, cluster, or update reports
CREATE POLICY "Authenticated operators update reports"
  ON public.citizen_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- D. Secure RPC function for Citizens to look up their own report by tracking token
-- This prevents table-wide SELECT scraping while enabling token confirmation.
CREATE OR REPLACE FUNCTION public.get_citizen_report_by_token(p_token text)
RETURNS SETOF public.citizen_reports
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.citizen_reports
  WHERE tracking_token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_citizen_report_by_token(text) TO anon, authenticated;


-- 4. OPERATOR PROFILES (RBAC)
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.operator_profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.operator_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.operator_profiles;

CREATE POLICY "Users read own profile"
  ON public.operator_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public.operator_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
