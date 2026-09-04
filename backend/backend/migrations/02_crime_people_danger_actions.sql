-- ============================================================
-- Migration: 02_crime_people_danger_actions.sql
-- Description: Creates crime_people (Criminal Bureau Registry) 
--              and danger_actions (Real-time detection alerts) tables.
-- Target DB: PostgreSQL (Supabase)
-- ============================================================

-- 1. Create crime_people table
CREATE TABLE IF NOT EXISTS public.crime_people (
    person_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    photo TEXT NOT NULL,
    crime_type VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'WANTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for crime_people
CREATE INDEX IF NOT EXISTS idx_crime_people_dept ON public.crime_people(department_id);
CREATE INDEX IF NOT EXISTS idx_crime_people_status ON public.crime_people(status);
CREATE INDEX IF NOT EXISTS idx_crime_people_crime_type ON public.crime_people(crime_type);

-- 2. Create danger_actions table
CREATE TABLE IF NOT EXISTS public.danger_actions (
    id VARCHAR(64) PRIMARY KEY,
    person_id VARCHAR(64) REFERENCES public.crime_people(person_id) ON DELETE CASCADE,
    camera_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL DEFAULT 'Dangerous Person Identified',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    department_id INT NOT NULL,
    alert_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for danger_actions
CREATE INDEX IF NOT EXISTS idx_danger_actions_person_id ON public.danger_actions(person_id);
CREATE INDEX IF NOT EXISTS idx_danger_actions_camera_id ON public.danger_actions(camera_id);
CREATE INDEX IF NOT EXISTS idx_danger_actions_dept_time ON public.danger_actions(department_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_danger_actions_status ON public.danger_actions(alert_status);
CREATE INDEX IF NOT EXISTS idx_danger_actions_timestamp ON public.danger_actions(timestamp DESC);

-- Enable RLS
ALTER TABLE public.crime_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danger_actions ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for authenticated users & service_role
CREATE POLICY "Allow public read crime_people" ON public.crime_people FOR SELECT USING (true);
CREATE POLICY "Allow service_role all crime_people" ON public.crime_people FOR ALL USING (true);

CREATE POLICY "Allow public read danger_actions" ON public.danger_actions FOR SELECT USING (true);
CREATE POLICY "Allow service_role all danger_actions" ON public.danger_actions FOR ALL USING (true);

-- 3. Initial Seed Data (Gujarat Police Wanted Registry)
INSERT INTO public.crime_people (person_id, name, photo, crime_type, department_id, status)
VALUES 
('CRM-8412', 'Vikramaditya Solanki', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', 'Armed Extortion & Gang Violence', 1, 'WANTED'),
('CRM-9021', 'Rohan Jayesh Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face', 'Financial Syndicate Fraud', 1, 'HIGH_ALERT'),
('CRM-7104', 'Dharmesh Rajput (Chhota)', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face', 'Inter-State Vehicle Theft Ring', 2, 'WANTED'),
('CRM-5542', 'Munna Bhai Kankaria', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face', 'Narcotics Distribution & Contraband', 1, 'UNDER_SURVEILLANCE'),
('CRM-3918', 'Kailash Govind Vaghela', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', 'Aggravated Robbery & Assault', 1, 'WANTED')
ON CONFLICT (person_id) DO NOTHING;

-- Initial Seed Detections
INSERT INTO public.danger_actions (id, person_id, camera_id, event_type, timestamp, department_id, alert_status, metadata)
VALUES 
('DNG-ACT-001', 'CRM-8412', 'CAM001', 'Dangerous Person Identified', NOW() - INTERVAL '15 minutes', 1, 'ACTIVE', '{"confidence": 0.94, "junction": "SG Highway Junction (Iskcon Cross Road), Ahmedabad", "zone": "Z01"}'::jsonb),
('DNG-ACT-002', 'CRM-7104', 'CAM004', 'Dangerous Person Identified', NOW() - INTERVAL '2 hours', 2, 'DISPATCHED', '{"confidence": 0.91, "junction": "Ashram Road Income Tax Circle, Ahmedabad", "zone": "Z01"}'::jsonb),
('DNG-ACT-003', 'CRM-3918', 'CAM007', 'Dangerous Person Identified', NOW() - INTERVAL '5 hours', 1, 'RESOLVED', '{"confidence": 0.89, "junction": "Kalupur Railway Station West Concourse, Ahmedabad", "zone": "Z02"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
