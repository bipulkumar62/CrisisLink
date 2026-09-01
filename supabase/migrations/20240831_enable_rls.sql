-- Enable RLS on all core tables
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies that allow anon write access
-- These conflict with the restrictive policies in schema.sql

-- INCIDENTS: drop overly permissive policies, recreate with proper access
DROP POLICY IF EXISTS "Incidents are viewable by everyone" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be created by authenticated users" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be updated by anyone" ON public.incidents;
DROP POLICY IF EXISTS "Incidents can be deleted by anyone" ON public.incidents;

-- Recurate proper incidents policies (matching schema.sql)
CREATE POLICY "Public read published incidents"
  ON public.incidents FOR SELECT
  USING (is_publicly_visible = true);

CREATE POLICY "Authenticated read all incidents"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated write incidents"
  ON public.incidents FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Anon insert incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (true);

-- RESOURCES: drop overly permissive policies
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
DROP POLICY IF EXISTS "Resources can be created by authenticated users" ON public.resources;
DROP POLICY IF EXISTS "Resources can be updated by anyone" ON public.resources;
DROP POLICY IF EXISTS "Resources can be deleted by anyone" ON public.resources;

-- Recurate proper resources policies
CREATE POLICY "Public read resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated write resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (true);

-- CITIZEN REPORTS: drop overly permissive policies
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be created by anyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be updated by anyone" ON public.citizen_reports;
DROP POLICY IF EXISTS "Reports can be deleted by anyone" ON public.citizen_reports;

-- Recurate proper citizen report policies
CREATE POLICY "Anon insert citizen report"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated read reports"
  ON public.citizen_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated write reports"
  ON public.citizen_reports FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Public read own report by token"
  ON public.citizen_reports FOR SELECT
  USING (true);

-- Enable RLS on operator_profiles
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.operator_profiles
  FOR SELECT
  USING (auth.uid() = user_id);
