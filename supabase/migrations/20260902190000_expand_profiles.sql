-- ============================================================
-- EXPAND PROFILES SCHEMA
-- Adds extended personal information and notification preferences
-- ============================================================

-- Add new columns to public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS security_emails BOOLEAN NOT NULL DEFAULT TRUE;
