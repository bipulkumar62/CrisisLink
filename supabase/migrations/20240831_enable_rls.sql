-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- INCIDENTS POLICIES
DROP POLICY IF EXISTS "Incidents are viewable by everyone" ON public.incidents;
CREATE POLICY "Incidents are viewable by everyone" 
ON public.incidents FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Incidents can be created by authenticated users" ON public.incidents;
CREATE POLICY "Incidents can be created by authenticated users" 
ON public.incidents FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Incidents can be updated by authenticated users" ON public.incidents;
CREATE POLICY "Incidents can be updated by authenticated users" 
ON public.incidents FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Incidents can be deleted by authenticated users" ON public.incidents;
CREATE POLICY "Incidents can be deleted by authenticated users" 
ON public.incidents FOR DELETE 
TO authenticated 
USING (true);


-- RESOURCES POLICIES
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Resources can be created by authenticated users" ON public.resources;
CREATE POLICY "Resources can be created by authenticated users" 
ON public.resources FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Resources can be updated by authenticated users" ON public.resources;
CREATE POLICY "Resources can be updated by authenticated users" 
ON public.resources FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Resources can be deleted by authenticated users" ON public.resources;
CREATE POLICY "Resources can be deleted by authenticated users" 
ON public.resources FOR DELETE 
TO authenticated 
USING (true);


-- CITIZEN REPORTS POLICIES
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.citizen_reports;
CREATE POLICY "Reports are viewable by everyone" 
ON public.citizen_reports FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Reports can be created by anyone" ON public.citizen_reports;
CREATE POLICY "Reports can be created by anyone" 
ON public.citizen_reports FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Reports can be updated by authenticated users" ON public.citizen_reports;
CREATE POLICY "Reports can be updated by authenticated users" 
ON public.citizen_reports FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Reports can be deleted by authenticated users" ON public.citizen_reports;
CREATE POLICY "Reports can be deleted by authenticated users" 
ON public.citizen_reports FOR DELETE 
TO authenticated 
USING (true);
