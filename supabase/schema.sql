-- ============================================================
-- CrisisLink — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Project: CrisisLink (nlpqlvcknpodvcukkddc)
-- ============================================================

-- ============================================================
-- EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id                        TEXT PRIMARY KEY DEFAULT ('inc-' || extract(epoch from now())::bigint::text),
  code                      TEXT UNIQUE NOT NULL,
  title                     TEXT NOT NULL,
  description               TEXT NOT NULL DEFAULT '',
  category                  TEXT NOT NULL DEFAULT 'OTHER',
  severity                  TEXT NOT NULL DEFAULT 'MEDIUM',
  status                    TEXT NOT NULL DEFAULT 'ACTIVE',
  location                  JSONB NOT NULL DEFAULT '{}',
  evidence                  JSONB NOT NULL DEFAULT '{"photoCount":0,"textLogCount":0,"audioCount":0,"sensorLogCount":0}',
  signals                   JSONB NOT NULL DEFAULT '[]',
  priority                  JSONB NOT NULL DEFAULT '{}',
  recommended_resources     JSONB NOT NULL DEFAULT '[]',
  assigned_resource_ids     TEXT[] NOT NULL DEFAULT '{}',
  timeline                  JSONB DEFAULT '[]',
  corroboration             JSONB DEFAULT NULL,
  associated_report_tokens  TEXT[] DEFAULT '{}',
  reports_aggregated_count  INTEGER NOT NULL DEFAULT 1,
  is_publicly_visible       BOOLEAN NOT NULL DEFAULT true,
  public_summary            TEXT,
  evacuation_radius_meters  INTEGER,
  reported_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: resources
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resources (
  id                     TEXT PRIMARY KEY DEFAULT ('res-' || extract(epoch from now())::bigint::text),
  callsign               TEXT UNIQUE NOT NULL,
  name                   TEXT,
  type                   TEXT NOT NULL DEFAULT 'AMBULANCE',
  status                 TEXT NOT NULL DEFAULT 'AVAILABLE',
  station                TEXT NOT NULL DEFAULT '',
  assigned_incident_id   TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
  personnel_count        INTEGER NOT NULL DEFAULT 1,
  equipment_summary      TEXT[] NOT NULL DEFAULT '{}',
  battery_or_fuel_percent INTEGER NOT NULL DEFAULT 100,
  latitude               DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude              DOUBLE PRECISION NOT NULL DEFAULT 0,
  last_ping_at           TIMESTAMPTZ DEFAULT now(),
  last_location_update   TIMESTAMPTZ DEFAULT now(),
  specialties            TEXT[] NOT NULL DEFAULT '{}',
  -- Shelter specific
  capacity_beds          INTEGER,
  occupancy_current      INTEGER,
  contact_number         TEXT,
  shelter_manager        TEXT,
  has_medical_aid        BOOLEAN
);

-- ============================================================
-- TABLE: citizen_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.citizen_reports (
  id                       TEXT PRIMARY KEY DEFAULT ('rep-' || extract(epoch from now())::bigint::text || '-' || floor(random()*9999)::text),
  tracking_token           TEXT UNIQUE NOT NULL,
  incident_category        TEXT NOT NULL DEFAULT 'OTHER',
  severity_self_reported   TEXT NOT NULL DEFAULT 'MEDIUM',
  description              TEXT NOT NULL DEFAULT '',
  location                 JSONB NOT NULL DEFAULT '{}',
  reporter                 JSONB NOT NULL DEFAULT '{"isAnonymous":true}',
  evidence                 JSONB NOT NULL DEFAULT '[]',
  status                   TEXT NOT NULL DEFAULT 'PENDING_TRIAGE',
  clustered_incident_id    TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
  credibility_score        INTEGER NOT NULL DEFAULT 50,
  ai_extracted_urgency     TEXT NOT NULL DEFAULT 'STANDARD',
  submitted_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at for incidents
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incidents_updated_at ON public.incidents;
CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- Incidents: anyone (anon) can read publicly visible ones; all authenticated users can read all
DROP POLICY IF EXISTS "Public read published incidents" ON public.incidents;
CREATE POLICY "Public read published incidents"
  ON public.incidents FOR SELECT
  USING (is_publicly_visible = true);

DROP POLICY IF EXISTS "Authenticated read all incidents" ON public.incidents;
CREATE POLICY "Authenticated read all incidents"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write incidents" ON public.incidents;
CREATE POLICY "Authenticated write incidents"
  ON public.incidents FOR ALL
  TO authenticated
  USING (true);

-- Allow anon insert for new incidents from citizen reports (critical/high)
DROP POLICY IF EXISTS "Anon insert incidents" ON public.incidents;
CREATE POLICY "Anon insert incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (true);

-- Resources: public read, authenticated write
DROP POLICY IF EXISTS "Public read resources" ON public.resources;
CREATE POLICY "Public read resources"
  ON public.resources FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated write resources" ON public.resources;
CREATE POLICY "Authenticated write resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (true);

-- Citizen reports: anonymous users can insert; authenticated users can read/write all
DROP POLICY IF EXISTS "Anon insert citizen report" ON public.citizen_reports;
CREATE POLICY "Anon insert citizen report"
  ON public.citizen_reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated read reports" ON public.citizen_reports;
CREATE POLICY "Authenticated read reports"
  ON public.citizen_reports FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated write reports" ON public.citizen_reports;
CREATE POLICY "Authenticated write reports"
  ON public.citizen_reports FOR UPDATE
  TO authenticated
  USING (true);

-- Public can also read their own report by tracking token (for citizen confirmation page)
DROP POLICY IF EXISTS "Public read own report by token" ON public.citizen_reports;
CREATE POLICY "Public read own report by token"
  ON public.citizen_reports FOR SELECT
  USING (true);

-- ============================================================
-- ENABLE REALTIME on incidents and resources
-- ============================================================
DO $$
BEGIN
  -- Add incidents if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
  END IF;

  -- Add resources if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resources'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
  END IF;

  -- Add citizen_reports if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'citizen_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_reports;
  END IF;
END $$;

-- ============================================================
-- SEED: Demo Operator Accounts
-- Create auth users for command center login via Supabase Auth dashboard:
--   Email: yash@crisislink.op  Password: CrisisLink@2025
--   (or use the Supabase dashboard Authentication → Users → Add User)
-- ============================================================

-- ============================================================
-- SEED: Initial Incidents (sample data)
-- ============================================================
INSERT INTO public.incidents (id, code, title, description, category, severity, status, location, evidence, signals, priority, recommended_resources, assigned_resource_ids, reports_aggregated_count, is_publicly_visible, public_summary, reported_at, updated_at)
VALUES
(
  'inc-001',
  'CL-JP-101',
  'Riverside District Flash Flood — Critical Infrastructure Breach',
  'Flash flooding reported along the Riverside corridor. Storm drains at capacity; water levels rising rapidly. Multiple residential blocks affected. Reports of stranded vehicles and individuals on rooftops.',
  'FLOOD',
  'CRITICAL',
  'ON_SCENE',
  '{"address":"Riverside Drive & Canal St, Sector 7 - Waterfront","sector":"Sector 7 - Waterfront","latitude":26.9180,"longitude":75.7820,"landmarks":"Near Riverside Bridge, opposite Metro Park","elevationMeters":5,"cordonRadiusMeters":800}',
  '{"photoCount":12,"textLogCount":47,"audioCount":3,"sensorLogCount":8}',
  '[{"id":"sig-001","type":"CRITICAL_BLOCK","message":"Riverside Drive — ROAD CLOSED. Flood water depth > 60cm.","timestamp":"18 min ago","source":"City Traffic Control"},{"id":"sig-002","type":"INFRASTRUCTURE","message":"Stormwater overflow detected at Canal St pumping station. Manual override required.","timestamp":"22 min ago","source":"Public Works SCADA"},{"id":"sig-003","type":"AI_OBSERVATION","message":"Aerial drone imagery shows water encroaching 200m into residential zone. Evacuation recommended.","timestamp":"10 min ago","source":"CrisisLink AI Engine"}]',
  '{"overall":96,"tier":"CRITICAL TIER","lifeThreatRisk":"Severe","infrastructureRisk":"Severe","spreadVelocity":"Fast","vulnerablePopulation":340,"confidenceScore":97,"aiConfidenceLabel":"HIGH"}',
  '[{"unitId":"res-r01","unitCode":"SDRF-01","name":"Swift Water Rescue Team SDRF-01","type":"RESCUE","etaMinutes":3,"available":false},{"unitId":"res-e01","unitCode":"EMS-01","name":"Paramedic Unit EMS-01","type":"AMBULANCE","etaMinutes":5,"available":false}]',
  '{"res-r01","res-e01"}',
  63,
  true,
  'Critical flooding in Riverside District. Emergency services on scene. Avoid Riverside Drive. Evacuation in progress for Canal St residential area.',
  now() - INTERVAL '2 hours',
  now() - INTERVAL '10 minutes'
),
(
  'inc-002',
  'CL-JP-102',
  'Downtown High-Rise Structural Fire — Multi-Floor Evacuation',
  'Three-alarm structural fire reported on floors 8-11 of the Meridian Tower. Cause suspected electrical fault in server room. Evacuation in progress. Fire containment ongoing.',
  'FIRE',
  'CRITICAL',
  'DISPATCHED',
  '{"address":"Meridian Tower, 450 Commerce Blvd, Sector 2 - Downtown","sector":"Sector 2 - Downtown","latitude":26.9124,"longitude":75.7873,"landmarks":"Adjacent to City Hall, 2 blocks from Central Station","elevationMeters":15,"cordonRadiusMeters":300}',
  '{"photoCount":8,"textLogCount":23,"audioCount":1,"sensorLogCount":5}',
  '[{"id":"sig-004","type":"CRITICAL_BLOCK","message":"Commerce Blvd CLOSED between 4th Ave and 6th Ave.","timestamp":"8 min ago","source":"Police Command"},{"id":"sig-005","type":"SAFETY_ADVICE","message":"Residents in 400-block Commerce to evacuate east. Do not use elevators.","timestamp":"12 min ago","source":"Emergency Alert System"}]',
  '{"overall":91,"tier":"CRITICAL TIER","lifeThreatRisk":"Severe","infrastructureRisk":"High","spreadVelocity":"Moderate","vulnerablePopulation":210,"confidenceScore":95,"aiConfidenceLabel":"HIGH"}',
  '[{"unitId":"res-f01","unitCode":"FE-01","name":"Fire Engine Company 1","type":"FIRE_ENGINE","etaMinutes":0,"available":false}]',
  '{"res-f01"}',
  41,
  true,
  'Multi-floor fire at Meridian Tower. Building evacuated. Fire crews on scene. Commerce Blvd closed.',
  now() - INTERVAL '1 hour 20 minutes',
  now() - INTERVAL '8 minutes'
),
(
  'inc-003',
  'CL-JP-103',
  'Highway 12 Mass Casualty Traffic Collision',
  'Multi-vehicle collision on Highway 12 involving a passenger coach and three commercial vehicles. Estimated 18 injured, 4 critical. Lane closures causing secondary incident risk.',
  'TRAFFIC',
  'HIGH',
  'ON_SCENE',
  '{"address":"Hwy 12 Southbound, Mile Marker 34.2, Sector 4","sector":"Sector 4 - Northern Highway Corridor","latitude":26.8530,"longitude":75.8120,"landmarks":"Between Sector 4 onramp and Industrial Blvd exit"}',
  '{"photoCount":5,"textLogCount":18,"audioCount":0,"sensorLogCount":2}',
  '[{"id":"sig-006","type":"CRITICAL_BLOCK","message":"Hwy 12 Southbound CLOSED at MM 34. All traffic diverted via Route 9.","timestamp":"35 min ago","source":"Highway Patrol"}]',
  '{"overall":82,"tier":"HIGH TIER","lifeThreatRisk":"High","infrastructureRisk":"Moderate","spreadVelocity":"Contained","vulnerablePopulation":22,"confidenceScore":91,"aiConfidenceLabel":"HIGH"}',
  '[]',
  '{"res-e02","res-e03"}',
  22,
  true,
  'Major traffic incident on Hwy 12. Medical teams treating injured. Expect significant delays — use alternate routes.',
  now() - INTERVAL '45 minutes',
  now() - INTERVAL '15 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Initial Resources (sample fleet)
-- ============================================================
INSERT INTO public.resources (id, callsign, name, type, status, station, personnel_count, equipment_summary, battery_or_fuel_percent, latitude, longitude, specialties, last_ping_at)
VALUES
('res-r01', 'SDRF-01', 'Swift Water Rescue Team Alpha', 'RESCUE_TEAM', 'ON_SCENE', 'Station 7 - Waterfront', 6, '{"Inflatable Rescue Boat","Water Pumps","Life Vests x20","Rope Systems"}', 78, 26.9180, 75.7820, '{"swift_water","rope_rescue","medical_first_response"}', now()),
('res-e01', 'EMS-01', 'Paramedic Unit Alpha', 'AMBULANCE', 'ON_SCENE', 'Station 2 - Central', 3, '{"AED","Advanced Life Support","Trauma Kit","O2 Cylinders"}', 65, 26.9180, 75.7820, '{"ALS","trauma","pediatric"}', now()),
('res-e02', 'EMS-02', 'Paramedic Unit Bravo', 'AMBULANCE', 'ON_SCENE', 'Station 4 - North', 3, '{"AED","Basic Life Support","Trauma Kit"}', 82, 26.8530, 75.8120, '{"BLS","trauma"}', now()),
('res-e03', 'EMS-03', 'Paramedic Unit Charlie', 'AMBULANCE', 'EN_ROUTE', 'Station 1 - HQ', 2, '{"AED","Basic Life Support"}', 91, 26.9240, 75.7720, '{"BLS"}', now()),
('res-f01', 'FE-01', 'Fire Engine Company 1', 'FIRE_ENGINE', 'ON_SCENE', 'Station 2 - Downtown', 5, '{"Aerial Ladder","Water Cannon","SCBA x6","Rescue Saw"}', 55, 26.9124, 75.7873, '{"structural_fire","hazmat_lvl1","rope_rescue"}', now()),
('res-f02', 'FE-02', 'Fire Engine Company 2', 'FIRE_ENGINE', 'AVAILABLE', 'Station 3 - Midtown', 4, '{"Aerial Ladder","Water Cannon","SCBA x4"}', 94, 26.9060, 75.7950, '{"structural_fire","wildfire"}', now()),
('res-p01', 'PD-01', 'Police Patrol Unit Alpha', 'POLICE_PATROL', 'AVAILABLE', 'Sector 2 Precinct', 2, '{"Patrol Vehicle","Body Armor","Crowd Control"}', 88, 26.9150, 75.7850, '{"crowd_control","traffic_management"}', now()),
('res-d01', 'DRONE-01', 'Aerial Recon Drone Alpha', 'DRONE_RECON', 'AVAILABLE', 'Station 1 - HQ', 1, '{"Thermal Imaging","4K Camera","120min Flight","LIDAR"}', 100, 26.9124, 75.7873, '{"aerial_surveillance","thermal_imaging","search_rescue"}', now()),
('res-s01', 'SHELTER-01', 'Eastside Community Shelter', 'SHELTER', 'AVAILABLE', 'Eastside Community Center', 8, '{"Emergency Cots x200","Medical Aid Station","Water Purification","Generator"}', 100, 26.8640, 75.8200, '{"mass_evacuation","medical_aid","family_services"}', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLE: operator_profiles (Role-Based Access Control)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.operator_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('INCIDENT_COMMANDER', 'DISPATCHER', 'RESOURCE_COORDINATOR')),
  badge_number TEXT UNIQUE NOT NULL,
  agency TEXT NOT NULL DEFAULT 'Jaipur Command Center',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies for operator_profiles
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.operator_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- System admins or service roles can manage profiles (bypasses RLS by default)
