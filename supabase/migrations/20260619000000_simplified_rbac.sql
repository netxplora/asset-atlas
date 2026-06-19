-- ============================================================
-- SIMPLIFIED RBAC MIGRATION
-- Transition from user_roles table to profiles.role column
-- Two roles only: 'admin' and 'user'
-- ============================================================

-- 1. Add role column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Add CHECK constraint to enforce only valid roles
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_profiles_role CHECK (role IN ('admin', 'user'));

-- 2. Migrate existing admins from user_roles into profiles.role
UPDATE public.profiles
SET role = 'admin'
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);

-- 3. Update has_role() to check profiles.role instead of user_roles
-- This keeps backward compatibility with all existing RLS policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role::text
  )
$$;

-- 4. Create promote_to_admin RPC
CREATE OR REPLACE FUNCTION public.promote_to_admin(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_role TEXT;
BEGIN
  -- Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can promote users';
  END IF;

  -- Check that the target user exists
  SELECT role INTO v_target_role
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if already admin
  IF v_target_role = 'admin' THEN
    RAISE EXCEPTION 'User is already an administrator';
  END IF;

  -- Promote the user
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE user_id = p_user_id;

  -- Also sync to user_roles for backward compatibility
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_id, action, target_id, details)
  VALUES (
    auth.uid(),
    'PROMOTE_TO_ADMIN',
    p_user_id,
    jsonb_build_object(
      'previous_role', 'user',
      'new_role', 'admin',
      'promoted_by', auth.uid()
    )
  );
END;
$$;

-- 5. Create revoke_admin RPC
CREATE OR REPLACE FUNCTION public.revoke_admin(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_role TEXT;
  v_admin_count INTEGER;
BEGIN
  -- Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can revoke admin access';
  END IF;

  -- Prevent self-demotion
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'You cannot revoke your own admin access';
  END IF;

  -- Check that the target user exists and is actually an admin
  SELECT role INTO v_target_role
  FROM public.profiles
  WHERE user_id = p_user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_target_role != 'admin' THEN
    RAISE EXCEPTION 'User is not an administrator';
  END IF;

  -- Enforce minimum one admin remains
  SELECT COUNT(*) INTO v_admin_count
  FROM public.profiles
  WHERE role = 'admin';

  IF v_admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot revoke the last administrator. At least one admin must remain.';
  END IF;

  -- Revoke the admin role
  UPDATE public.profiles
  SET role = 'user', updated_at = now()
  WHERE user_id = p_user_id;

  -- Also remove from user_roles for consistency
  DELETE FROM public.user_roles
  WHERE user_id = p_user_id AND role = 'admin';

  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_id, action, target_id, details)
  VALUES (
    auth.uid(),
    'REVOKE_ADMIN',
    p_user_id,
    jsonb_build_object(
      'previous_role', 'admin',
      'new_role', 'user',
      'revoked_by', auth.uid()
    )
  );
END;
$$;

-- 6. Drop the old make_me_admin RPC (no longer needed)
DROP FUNCTION IF EXISTS public.make_me_admin();

-- 7. Create index on profiles.role for efficient admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
