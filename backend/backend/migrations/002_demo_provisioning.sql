-- Migration: 002_demo_provisioning.sql
-- Description: Adds 'DEMO_PROVISIONED' to access_requests status CHECK constraint.
--              Allows explicit differentiation between real administrative approval ('APPROVED')
--              and automated hackathon/demo provisioning ('DEMO_PROVISIONED').
-- Target DB: PostgreSQL (Supabase)
-- IMPORTANT: DO NOT EXECUTE AUTOMATICALLY. Staged for review only.

-- 1. Drop existing check constraint if present
ALTER TABLE public.access_requests 
DROP CONSTRAINT IF EXISTS access_requests_status_check;

-- 2. Add updated check constraint including DEMO_PROVISIONED
ALTER TABLE public.access_requests 
ADD CONSTRAINT access_requests_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DEMO_PROVISIONED'));
