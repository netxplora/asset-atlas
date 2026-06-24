-- ============================================================
-- AUTHORIZATION HARDENING MIGRATION
-- 1. Drop dangerous make_me_admin() RPC (defense-in-depth)
-- 2. Fix investment_plans admin policy (swapped arguments)
-- ============================================================

-- 1. Guarantee make_me_admin() is dropped
-- The simplified_rbac migration already attempts this, but we
-- re-run it as a safety net in case migrations ran out of order
-- or the function was recreated manually.
DROP FUNCTION IF EXISTS public.make_me_admin();

-- 2. Fix the investment_plans admin policy
-- Original policy had swapped arguments: has_role('admin', auth.uid())
-- Correct signature is: has_role(_user_id UUID, _role app_role)
DROP POLICY IF EXISTS "Enable all metadata access for admins" ON public.investment_plans;
DROP POLICY IF EXISTS "Admins can manage investment plans" ON public.investment_plans;
CREATE POLICY "Admins can manage investment plans" ON public.investment_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
