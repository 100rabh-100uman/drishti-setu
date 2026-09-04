-- ============================================================
-- Migration: 03_incidents_and_crime_bureau.sql
-- Description: Creates the incidents table and crime_bureau view/schema.
--              Adds query optimization indexes on timestamp and person_id.
-- Target DB: PostgreSQL (Supabase / PostGIS)
-- ============================================================

-- 1. Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
    id VARCHAR(64) PRIMARY KEY,
    incident_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISPATCHED', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),
    camera_id VARCHAR(64) NOT NULL,
    person_id VARCHAR(64) REFERENCES public.crime_people(person_id) ON DELETE SET NULL,
    department_id INT NOT NULL DEFAULT 1,
    zone_id VARCHAR(50) DEFAULT 'Z01',
    location_name VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance & Query Optimization Indexes
-- Explicit indexes on timestamp and person_id as requested
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_person_id ON public.incidents (person_id);
CREATE INDEX IF NOT EXISTS idx_incidents_zone_id ON public.incidents (zone_id);
CREATE INDEX IF NOT EXISTS idx_incidents_crime_type ON public.incidents (crime_type);
CREATE INDEX IF NOT EXISTS idx_incidents_dept_time ON public.incidents (department_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents (status);

-- Also optimize danger_actions and crime_people indexes
CREATE INDEX IF NOT EXISTS idx_danger_actions_timestamp ON public.danger_actions (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_danger_actions_person_id ON public.danger_actions (person_id);
CREATE INDEX IF NOT EXISTS idx_crime_people_person_id ON public.crime_people (person_id);

-- 3. Crime Bureau Compatibility View
-- Provides standardized crime_bureau alias mapped to crime_people
CREATE OR REPLACE VIEW public.crime_bureau AS 
SELECT 
    person_id,
    name,
    photo,
    crime_type,
    department_id,
    status,
    created_at,
    updated_at
FROM public.crime_people;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public/authenticated read and service_role write
DROP POLICY IF EXISTS "Allow public read incidents" ON public.incidents;
CREATE POLICY "Allow public read incidents" ON public.incidents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert incidents" ON public.incidents;
CREATE POLICY "Allow authenticated insert incidents" ON public.incidents FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update incidents" ON public.incidents;
CREATE POLICY "Allow authenticated update incidents" ON public.incidents FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow service_role all incidents" ON public.incidents;
CREATE POLICY "Allow service_role all incidents" ON public.incidents FOR ALL USING (true);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_incidents_updated_at ON public.incidents;
CREATE TRIGGER trigger_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION update_incidents_updated_at();

-- 7. Seed Data for Incident Corner (Gujarat Police Corridor Detections)
-- Multi-day distribution for date-grouped timeline UI demonstration
INSERT INTO public.incidents (
    id, incident_number, title, crime_type, severity, status, camera_id, person_id, department_id, zone_id, location_name, timestamp, metadata
)
VALUES 
-- TODAY's Incidents
(
    'INC-2026-001',
    'INC-GJ-2026-0905-01',
    'High-Priority Wanted Suspect Sighted at SG Highway Junction',
    'Armed Extortion & Gang Violence',
    'CRITICAL',
    'ACTIVE',
    'CAM001',
    'CRM-8412',
    1,
    'Z01',
    'SG Highway Junction (Iskcon Cross Road), Ahmedabad',
    NOW() - INTERVAL '12 minutes',
    '{"confidence": 0.96, "speed_kmh": 44, "threat_level": "RED", "vehicle_color": "Silver", "notes": "Suspect matched via Sentinel Facial AI with 96% accuracy"}'::jsonb
),
(
    'INC-2026-002',
    'INC-GJ-2026-0905-02',
    'Vehicle Theft Syndicate Operator Flagged by ANPR Telemetry',
    'Inter-State Vehicle Theft Ring',
    'HIGH',
    'DISPATCHED',
    'CAM004',
    'CRM-7104',
    2,
    'Z01',
    'Ashram Road Income Tax Circle, Ahmedabad',
    NOW() - INTERVAL '1 hour 45 minutes',
    '{"confidence": 0.92, "vehicle_plate": "GJ-01-BK-5821", "vehicle_model": "Mahindra Scorpio", "notes": "Quick Response Unit (PCR Unit 4) dispatched to intercept"}'::jsonb
),
(
    'INC-2026-003',
    'INC-GJ-2026-0905-03',
    'Financial Syndicate Fraud Kingpin Sighted near Vastrapur',
    'Financial Syndicate Fraud',
    'MEDIUM',
    'INVESTIGATING',
    'CAM002',
    'CRM-9021',
    1,
    'Z01',
    'Vastrapur Lake East Gate, Ahmedabad',
    NOW() - INTERVAL '3 hours 10 minutes',
    '{"confidence": 0.88, "notes": "Subject spotted entering commercial tower with suspected associates"}'::jsonb
),

-- YESTERDAY's Incidents
(
    'INC-2026-004',
    'INC-GJ-2026-0904-01',
    'Armed Robbery Suspect Intercepted and Apprehended',
    'Aggravated Robbery & Assault',
    'CRITICAL',
    'RESOLVED',
    'CAM007',
    'CRM-3918',
    1,
    'Z02',
    'Kalupur Railway Station West Concourse, Ahmedabad',
    NOW() - INTERVAL '26 hours',
    '{"confidence": 0.94, "resolution": "Subject taken into custody by Kalupur Railway Police. Evidence seized."}'::jsonb
),
(
    'INC-2026-005',
    'INC-GJ-2026-0904-02',
    'Narcotics Courier Monitored along Walled City Corridor',
    'Narcotics Distribution & Contraband',
    'HIGH',
    'RESOLVED',
    'CAM006',
    'CRM-5542',
    1,
    'Z02',
    'Relief Road Junction, Walled City, Ahmedabad',
    NOW() - INTERVAL '31 hours',
    '{"confidence": 0.89, "resolution": "Undercover surveillance maintained. Contraband drop point mapped."}'::jsonb
),

-- EARLIER Incidents
(
    'INC-2026-006',
    'INC-GJ-2026-0903-01',
    'Infocity Perimeter Anomaly - Vehicle Loitering Warning',
    'Security Perimeter Breach',
    'MEDIUM',
    'CLOSED',
    'CAM011',
    NULL,
    5,
    'Z03',
    'Infocity Main Gate, Gandhinagar',
    NOW() - INTERVAL '48 hours',
    '{"confidence": 0.85, "notes": "Vehicle identification completed. Operator confirmed authorized delivery."}'::jsonb
),
(
    'INC-2026-007',
    'INC-GJ-2026-0902-01',
    'Sanand Highway Night Perimeter Sensor Alert',
    'Industrial Checkpost Alert',
    'LOW',
    'CLOSED',
    'CAM020',
    NULL,
    1,
    'Z05',
    'Sanand Industrial Approach Toll Plaza, Ahmedabad',
    NOW() - INTERVAL '72 hours',
    '{"confidence": 0.81, "notes": "Routine night patrol verification cleared."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
