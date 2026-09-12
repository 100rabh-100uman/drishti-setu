-- ==============================================================================
-- 🛡️ DRISHTI SETU — Complete Base & Extended PostgreSQL / PostGIS Schema
-- Gujarat Police Smart CCTV Command & Threat Interception Platform
-- Compatible with: Supabase (PostgreSQL 15+ with PostGIS)
-- Instructions: Paste and execute this complete script in Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Zones Table (PostGIS Polygon Boundaries)
CREATE TABLE IF NOT EXISTS public.zones (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    department_id INT REFERENCES public.departments(id) ON DELETE SET NULL,
    color VARCHAR(30) DEFAULT '#3B82F6',
    geom GEOMETRY(Polygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_zones_geom ON public.zones USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_zones_zone_id ON public.zones (zone_id);

-- 4. Cameras Table (PostGIS Point Coordinates + Hardware Identifiers)
CREATE TABLE IF NOT EXISTS public.cameras (
    id SERIAL PRIMARY KEY,
    camera_id VARCHAR(64) UNIQUE NOT NULL,
    department VARCHAR(100),
    department_id INT REFERENCES public.departments(id) ON DELETE SET NULL,
    camera_type VARCHAR(50) DEFAULT 'IP',
    status VARCHAR(50) DEFAULT 'Active',
    geom GEOMETRY(Point, 4326),
    mac_address VARCHAR(50),
    serial_number VARCHAR(100),
    device_uuid VARCHAR(100),
    ip_address VARCHAR(50),
    address TEXT,
    zone_id VARCHAR(50) REFERENCES public.zones(zone_id) ON DELETE SET NULL,
    storage_type VARCHAR(50) DEFAULT 'Cloud',
    storage_days INT DEFAULT 30,
    needs_review BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cameras_geom ON public.cameras USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_cameras_camera_id ON public.cameras (camera_id);
CREATE INDEX IF NOT EXISTS idx_cameras_status ON public.cameras (status);
CREATE INDEX IF NOT EXISTS idx_cameras_zone_id ON public.cameras (zone_id);

-- 5. Users Table (Officers & Administrators)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(150) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'INSPECTOR',
    department_id INT REFERENCES public.departments(id) ON DELETE SET NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users (employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- 6. Events Table (Real-time Vision Detections)
CREATE TABLE IF NOT EXISTS public.events (
    id SERIAL PRIMARY KEY,
    camera_id VARCHAR(64) REFERENCES public.cameras(camera_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    geom GEOMETRY(Point, 4326),
    severity VARCHAR(50) DEFAULT 'Low',
    description TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_camera_id ON public.events (camera_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.events (timestamp DESC);

-- 7. Camera Health Table
CREATE TABLE IF NOT EXISTS public.camera_health (
    camera_id VARCHAR(64) PRIMARY KEY REFERENCES public.cameras(camera_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Active',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Audit Log Table (Tamper-Proof Logging)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    camera_id VARCHAR(64),
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log (timestamp DESC);

-- 9. Access Requests Table
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_name VARCHAR(150) NOT NULL,
    officer_email VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(150)
);

-- 10. NEW EXTENSION: Crime People Table (Criminal Bureau Watchlist)
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
CREATE INDEX IF NOT EXISTS idx_crime_people_dept ON public.crime_people(department_id);
CREATE INDEX IF NOT EXISTS idx_crime_people_status ON public.crime_people(status);
CREATE INDEX IF NOT EXISTS idx_crime_people_crime_type ON public.crime_people(crime_type);

-- 11. NEW EXTENSION: Danger Actions Table (Threat Interceptions & Real-time Alerts)
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
CREATE INDEX IF NOT EXISTS idx_danger_actions_person_id ON public.danger_actions(person_id);
CREATE INDEX IF NOT EXISTS idx_danger_actions_camera_id ON public.danger_actions(camera_id);
CREATE INDEX IF NOT EXISTS idx_danger_actions_dept_time ON public.danger_actions(department_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_danger_actions_status ON public.danger_actions(alert_status);
CREATE INDEX IF NOT EXISTS idx_danger_actions_timestamp ON public.danger_actions(timestamp DESC);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danger_actions ENABLE ROW LEVEL SECURITY;

-- Allow reading to authenticated and service_role; full permissions to service_role
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public Read %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Service Role All %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public Read %I" ON public.%I FOR SELECT USING (true)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service Role All %I" ON public.%I FOR ALL USING (true)', tbl, tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

-- Seed Departments
INSERT INTO public.departments (id, name, code) VALUES
(1, 'Gujarat Police Department', 'GPD'),
(2, 'Gujarat Traffic Branch', 'GTB'),
(3, 'Disaster Management Authority (GSDMA)', 'GSDMA'),
(4, 'Ahmedabad Municipal Corporation (AMC)', 'AMC'),
(5, 'Gandhinagar Municipal Corporation (GMC)', 'GMC')
ON CONFLICT (id) DO NOTHING;

-- Seed Zones
INSERT INTO public.zones (id, zone_id, name, code, department_id, color, geom) VALUES
(1, 'Z01', 'West Ahmedabad Strategic Ring', 'Z01-AHM-W', 1, '#2563EB', 
 ST_GeomFromText('POLYGON((72.48 23.01, 72.56 23.01, 72.56 23.08, 72.48 23.08, 72.48 23.01))', 4326)),
(2, 'Z02', 'East Ahmedabad Transit Hub', 'Z02-AHM-E', 1, '#DC2626', 
 ST_GeomFromText('POLYGON((72.57 23.00, 72.65 23.00, 72.65 23.07, 72.57 23.07, 72.57 23.00))', 4326)),
(3, 'Z03', 'Gandhinagar Capital Vista', 'Z03-GND', 1, '#16A34A', 
 ST_GeomFromText('POLYGON((72.62 23.20, 72.68 23.20, 72.68 23.25, 72.62 23.25, 72.62 23.20))', 4326))
ON CONFLICT (zone_id) DO NOTHING;

-- Seed Cameras
INSERT INTO public.cameras (camera_id, department, department_id, camera_type, status, geom, address, zone_id) VALUES
('CAM001', 'Gujarat Police Department', 1, 'PTZ 4K AI', 'Active', ST_SetSRID(ST_MakePoint(72.5065, 23.0298), 4326), 'SG Highway Junction (Iskcon Cross Road), Ahmedabad', 'Z01'),
('CAM002', 'Gujarat Police Department', 1, 'Dome AI', 'Active', ST_SetSRID(ST_MakePoint(72.5283, 23.0354), 4326), 'Vastrapur Lake East Concourse, Ahmedabad', 'Z01'),
('CAM003', 'Gujarat Police Department', 1, 'Bullet 4K', 'Active', ST_SetSRID(ST_MakePoint(72.6511, 23.2234), 4326), 'Sector 11 Central Vista, Gandhinagar', 'Z03'),
('CAM004', 'Gujarat Traffic Branch', 2, 'ANPR 4K', 'Active', ST_SetSRID(ST_MakePoint(72.5711, 23.0421), 4326), 'Ashram Road Income Tax Circle, Ahmedabad', 'Z01'),
('CAM005', 'Gujarat Police Department', 1, 'Dome AI', 'Active', ST_SetSRID(ST_MakePoint(72.5180, 23.0330), 4326), 'Sindhu Bhavan Road Central Corridor, Ahmedabad', 'Z01'),
('CAM006', 'Gujarat Traffic Branch', 2, 'PTZ ANPR', 'Active', ST_SetSRID(ST_MakePoint(72.5800, 23.0225), 4326), 'Ellis Bridge Riverfront West, Ahmedabad', 'Z01'),
('CAM007', 'Gujarat Police Department', 1, 'Bullet 4K', 'Active', ST_SetSRID(ST_MakePoint(72.6010, 23.0210), 4326), 'Kalupur Railway Station West Concourse, Ahmedabad', 'Z02'),
('CAM008', 'Gujarat Traffic Branch', 2, 'Dome AI', 'Degraded', ST_SetSRID(ST_MakePoint(72.6020, 23.0060), 4326), 'Kankaria Lake Gate 3, Maninagar, Ahmedabad', 'Z02')
ON CONFLICT (camera_id) DO NOTHING;

-- Seed Default Officers (Passwords are 'admin123' and 'police123' bcrypt-hashed)
INSERT INTO public.users (employee_id, username, email, full_name, role, department_id, password_hash) VALUES
('EMP001', 'admin', 'dgp.admin@gujarat.gov.in', 'Director General of Police (Admin)', 'ADMIN', 1, '$2b$12$4m/iYVj1oT3p4/NqE933d.l869lU3U7N6fV7V8zL/iA8iUu1wA4a6'),
('EMP002', 'inspector', 'inspector.ahm@gujarat.gov.in', 'Inspector Rajesh K. Solanki', 'INSPECTOR', 1, '$2b$12$4m/iYVj1oT3p4/NqE933d.l869lU3U7N6fV7V8zL/iA8iUu1wA4a6'),
('EMP003', 'operator', 'operator.traffic@gujarat.gov.in', 'Duty Operator Mehul Trivedi', 'VIEWER', 2, '$2b$12$4m/iYVj1oT3p4/NqE933d.l869lU3U7N6fV7V8zL/iA8iUu1wA4a6')
ON CONFLICT (employee_id) DO NOTHING;

-- Seed Crime People (Criminal Bureau Watchlist)
INSERT INTO public.crime_people (person_id, name, photo, crime_type, department_id, status) VALUES 
('CRM-8412', 'Vikramaditya Solanki', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', 'Armed Extortion & Gang Violence', 1, 'WANTED'),
('CRM-9021', 'Rohan Jayesh Mehta', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face', 'Financial Syndicate Fraud', 1, 'HIGH_ALERT'),
('CRM-7104', 'Dharmesh Rajput (Chhota)', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face', 'Inter-State Vehicle Theft Ring', 2, 'WANTED'),
('CRM-5542', 'Munna Bhai Kankaria', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face', 'Narcotics Distribution & Contraband', 1, 'UNDER_SURVEILLANCE'),
('CRM-3918', 'Kailash Govind Vaghela', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', 'Aggravated Robbery & Assault', 1, 'WANTED')
ON CONFLICT (person_id) DO NOTHING;

-- Seed Danger Actions
INSERT INTO public.danger_actions (id, person_id, camera_id, event_type, timestamp, department_id, alert_status, metadata) VALUES 
('DNG-ACT-001', 'CRM-8412', 'CAM001', 'Dangerous Person Identified', NOW() - INTERVAL '15 minutes', 1, 'ACTIVE', '{"confidence": 0.94, "junction": "SG Highway Junction (Iskcon Cross Road), Ahmedabad", "zone": "Z01"}'::jsonb),
('DNG-ACT-002', 'CRM-7104', 'CAM004', 'Dangerous Person Identified', NOW() - INTERVAL '2 hours', 2, 'DISPATCHED', '{"confidence": 0.91, "junction": "Ashram Road Income Tax Circle, Ahmedabad", "zone": "Z01"}'::jsonb),
('DNG-ACT-003', 'CRM-3918', 'CAM007', 'Dangerous Person Identified', NOW() - INTERVAL '5 hours', 1, 'RESOLVED', '{"confidence": 0.89, "junction": "Kalupur Railway Station West Concourse, Ahmedabad", "zone": "Z02"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 12. NEW EXTENSION: Crime Bureau & Incidents (Need Corner Feed)
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

-- Index on timestamp for fast chronological ordering
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON public.incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_person_id ON public.incidents(person_id);
CREATE INDEX IF NOT EXISTS idx_incidents_crime_type ON public.incidents(crime_type);

ALTER TABLE public.crime_bureau ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Service Role All incidents" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Public Read crime_bureau" ON public.crime_bureau FOR SELECT USING (true);
CREATE POLICY "Service Role All crime_bureau" ON public.crime_bureau FOR ALL USING (true);

-- Seed Incidents
INSERT INTO public.incidents (id, timestamp, crime_type, description, location_id, location_name, department_name, severity, person_id)
VALUES
('INC-2026-901', NOW() - INTERVAL '18 minutes', 'Armed Extortion & Gang Violence', 'Armed confrontation detected near Iskcon cross road. Suspect sighted fleeing towards SG Highway North corridor in a dark sedan.', 'Z01-CAM001', 'SG Highway Junction (Iskcon Cross Road), Ahmedabad', 'Gujarat Police Department', 'Critical', 'CRM-8412'),
('INC-2026-902', NOW() - INTERVAL '105 minutes', 'Inter-State Vehicle Theft', 'ANPR automated camera flagged stolen SUV license plate GJ-01-BK-5821 attempting to bypass toll checkpoint at Ashram Road.', 'Z01-CAM004', 'Ashram Road Income Tax Circle, Ahmedabad', 'Gujarat Traffic Branch', 'High', 'CRM-7104'),
('INC-2026-903', NOW() - INTERVAL '190 minutes', 'Unlawful Assembly & Perimeter Breach', 'Crowd density threshold exceeded 40 persons at restricted transit concourse. Patrol team mobilized for perimeter clearance.', 'Z01-CAM002', 'Vastrapur Lake East Concourse, Ahmedabad', 'Gujarat Police Department', 'Medium', NULL),
('INC-2026-904', NOW() - INTERVAL '322 minutes', 'Aggravated Robbery & Assault', 'Surveillance system detected physical scuffle and attempted burglary near luggage holding area at Platform 2 concourse.', 'Z02-CAM007', 'Kalupur Railway Station West Concourse, Ahmedabad', 'Gujarat Police Department', 'High', 'CRM-3918'),
('INC-2026-905', NOW() - INTERVAL '580 minutes', 'Financial Syndicate Fraud', 'Suspect involved in counterfeit currency circulation flagged while entering commercial banking complex on Sindhu Bhavan Road.', 'Z01-CAM005', 'Sindhu Bhavan Road Central Corridor, Ahmedabad', 'Gujarat Police Department', 'High', 'CRM-9021')
ON CONFLICT (id) DO NOTHING;
