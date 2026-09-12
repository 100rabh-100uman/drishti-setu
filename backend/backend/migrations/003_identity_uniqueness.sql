-- Migration: 003_identity_uniqueness.sql
-- Description: Enforces normalized unique indexes for Employee ID, Official Email, and Mobile Number
--              across users and non-rejected access requests.
-- Target DB: PostgreSQL (Supabase)
-- Non-destructive: Does NOT modify, delete, or merge existing valid records.

-- 1. Case-insensitive unique index on users.employee_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_unique_norm_emp 
ON public.users (UPPER(TRIM(employee_id)));

-- 2. Unique index on access_requests.employee_id for active/onboarding requests (excluding REJECTED)
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_unique_norm_emp 
ON public.access_requests (UPPER(TRIM(employee_id))) 
WHERE status != 'REJECTED';

-- 3. Case-insensitive unique index on access_requests.official_email for active/onboarding requests (excluding REJECTED)
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_unique_norm_email 
ON public.access_requests (LOWER(TRIM(official_email))) 
WHERE status != 'REJECTED';

-- 4. Canonical 10-digit mobile number unique index for active/onboarding requests (excluding REJECTED)
-- Strips non-digits and canonicalizes to the last 10 digits
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_unique_norm_mobile 
ON public.access_requests (RIGHT(REGEXP_REPLACE(mobile_number, '\D', '', 'g'), 10)) 
WHERE status != 'REJECTED';
