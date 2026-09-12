-- ============================================================
-- DRISHTI SETU — Database Migration 005
-- Add Storage Architecture (Cloud/Local) and Retention Days
-- ============================================================

-- 1. Add storage_type and storage_days columns to public.cameras
ALTER TABLE public.cameras 
ADD COLUMN IF NOT EXISTS storage_type VARCHAR(50) DEFAULT 'Cloud',
ADD COLUMN IF NOT EXISTS storage_days INT DEFAULT 30;

-- 2. Optional: Add descriptive comments to columns
COMMENT ON COLUMN public.cameras.storage_type IS 'Storage architecture: Cloud, Local, or Hybrid';
COMMENT ON COLUMN public.cameras.storage_days IS 'Storage retention duration in days (e.g. 30, 60, 90, 180)';

-- 3. Optional: Backfill any existing rows with sensible defaults based on camera type
UPDATE public.cameras 
SET storage_type = 'Local', storage_days = 30 
WHERE storage_type IS NULL AND LOWER(camera_type) LIKE '%analog%';

UPDATE public.cameras 
SET storage_type = 'Cloud', storage_days = 60 
WHERE storage_type IS NULL;
