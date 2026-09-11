-- Migration: 001_create_access_requests.sql
-- Description: Creates the access_requests table with activation fields, constraints, and auditability.
--              Safely extends users table with is_active column (defaults to TRUE for legacy users).
-- Target DB: PostgreSQL (Supabase)
-- IMPORTANT: Run this manually in the Supabase SQL Editor. DO NOT EXECUTE AUTOMATICALLY.

-- 1. Create access_requests table
CREATE TABLE IF NOT EXISTS public.access_requests (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(36) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    official_email VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    department_id INT NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL,
    office_unit VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    requested_role VARCHAR(30) NOT NULL CHECK (requested_role IN ('Admin', 'Inspector', 'Viewer')),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by INT REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Activation & Account Lifecycle Fields
    user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    activation_token VARCHAR(64) UNIQUE,
    activation_token_expires_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: Prevent duplicate PENDING access requests for the same employee_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_unique_pending_emp 
ON public.access_requests(employee_id) 
WHERE status = 'PENDING';

-- Performance and filter indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_status 
ON public.access_requests(status);

CREATE INDEX IF NOT EXISTS idx_access_requests_department_id 
ON public.access_requests(department_id);

CREATE INDEX IF NOT EXISTS idx_access_requests_created_at 
ON public.access_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_requests_request_id 
ON public.access_requests(request_id);

CREATE INDEX IF NOT EXISTS idx_access_requests_activation_token 
ON public.access_requests(activation_token) 
WHERE activation_token IS NOT NULL;

-- 2. Updated_at trigger helper
CREATE OR REPLACE FUNCTION update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_access_requests_updated_at ON public.access_requests;
CREATE TRIGGER trigger_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION update_access_requests_updated_at();

-- 3. Safely add is_active column to existing users table
-- Existing users (EMP001, EMP002, EMP003) remain active automatically (DEFAULT TRUE)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Comments for documentation
COMMENT ON TABLE public.access_requests IS 'Controlled user onboarding requests requiring Admin review and self-activation';
COMMENT ON COLUMN public.access_requests.request_id IS 'Unique tracking identifier (e.g., REQ-YYYYMMDD-XXXX)';
COMMENT ON COLUMN public.access_requests.status IS 'Current lifecycle state: PENDING, APPROVED, or REJECTED';
COMMENT ON COLUMN public.access_requests.activation_token IS 'Cryptographic one-time token for password setup';
COMMENT ON COLUMN public.users.is_active IS 'Account activation status. Approved new requests start FALSE until password setup.';
