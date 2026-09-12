-- ============================================================
-- Migration: 03_incidents_crime_bureau.sql
-- Description: Creates incidents table with timestamp indexing
--              and provides compatibility with crime_bureau.
-- Target DB: PostgreSQL (Supabase)
-- ============================================================

-- 1. Create crime_bureau table (if not using crime_people directly)
CREATE TABLE IF NOT EXISTS public.crime_bureau (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    photo TEXT,
    crime_type VARCHAR(100) NOT NULL,
    record_summary TEXT,
    department_id INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'WANTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed crime_bureau from crime_people if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crime_people') THEN
        INSERT INTO public.crime_bureau (id, name, photo, crime_type, record_summary, department_id, status)
        SELECT 
            person_id, 
            name, 
            photo, 
            crime_type, 
            'Bureau Registry Match: ' || crime_type || ' (Status: ' || status || ')', 
            department_id, 
            status 
        FROM public.crime_people
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 2. Create incidents table (Need Corner feed)
CREATE TABLE IF NOT EXISTS public.incidents (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    crime_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location_id VARCHAR(100) NOT NULL,
    location_name VARCHAR(255),
    department_name VARCHAR(150) DEFAULT 'Gujarat Police Department',
    severity VARCHAR(30) DEFAULT 'High',
    person_id VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proper indexing on timestamp for fast chronological ordering (newest top)
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_person_id ON public.incidents(person_id);
CREATE INDEX IF NOT EXISTS idx_incidents_crime_type ON public.incidents(crime_type);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime_bureau ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Service Role All incidents" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Public Read crime_bureau" ON public.crime_bureau FOR SELECT USING (true);
CREATE POLICY "Service Role All crime_bureau" ON public.crime_bureau FOR ALL USING (true);

-- 3. Initial Seed Incidents
INSERT INTO public.incidents (id, timestamp, crime_type, description, location_id, location_name, department_name, severity, person_id)
VALUES
('INC-2026-901', NOW() - INTERVAL '18 minutes', 'Armed Extortion & Gang Violence', 'Armed confrontation detected near Iskcon cross road. Suspect sighted fleeing towards SG Highway North corridor in a dark sedan.', 'Z01-CAM001', 'SG Highway Junction (Iskcon Cross Road), Ahmedabad', 'Gujarat Police Department', 'Critical', 'CRM-8412'),
('INC-2026-902', NOW() - INTERVAL '105 minutes', 'Inter-State Vehicle Theft', 'ANPR automated camera flagged stolen SUV license plate GJ-01-BK-5821 attempting to bypass toll checkpoint at Ashram Road.', 'Z01-CAM004', 'Ashram Road Income Tax Circle, Ahmedabad', 'Gujarat Traffic Branch', 'High', 'CRM-7104'),
('INC-2026-903', NOW() - INTERVAL '190 minutes', 'Unlawful Assembly & Perimeter Breach', 'Crowd density threshold exceeded 40 persons at restricted transit concourse. Patrol team mobilized for perimeter clearance.', 'Z01-CAM002', 'Vastrapur Lake East Concourse, Ahmedabad', 'Gujarat Police Department', 'Medium', NULL),
('INC-2026-904', NOW() - INTERVAL '322 minutes', 'Aggravated Robbery & Assault', 'Surveillance system detected physical scuffle and attempted burglary near luggage holding area at Platform 2 concourse.', 'Z02-CAM007', 'Kalupur Railway Station West Concourse, Ahmedabad', 'Gujarat Police Department', 'High', 'CRM-3918'),
('INC-2026-905', NOW() - INTERVAL '580 minutes', 'Financial Syndicate Fraud', 'Suspect involved in counterfeit currency circulation flagged while entering commercial banking complex on Sindhu Bhavan Road.', 'Z01-CAM005', 'Sindhu Bhavan Road Central Corridor, Ahmedabad', 'Gujarat Police Department', 'High', 'CRM-9021')
ON CONFLICT (id) DO NOTHING;
