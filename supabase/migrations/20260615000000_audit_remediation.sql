-- PHASE 3: DATABASE AUDIT & OPTIMIZATION
-- Add B-tree indexes for foreign keys on high-traffic tables to improve read performance

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_copy_trades_user_id ON public.user_copy_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON public.user_investments(user_id);

-- PHASE 2: SECURITY AUDIT & REMEDIATION
-- Review RLS Policies

-- Transactions: Ensure users cannot insert transactions directly, only admins or system functions.
-- This was already correctly restricted to admins in the initial migration. Let's enforce it further if needed.
-- We verify `transactions` RLS:
-- CREATE POLICY "Admins can insert transactions" ON public.transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- This looks correct and secure.

-- Profiles: Ensure users can only update specific fields or prevent balance manipulation.
-- Currently: CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
-- This is DANGEROUS! If a user can update their own profile, they could potentially update their balance via PostgREST API!
-- Let's restrict the fields they can update. Wait, PostgreSQL RLS doesn't restrict columns natively inside standard policies without complex views or functions, but we can restrict column updates via triggers.

-- Trigger to prevent users from updating their own balance directly
CREATE OR REPLACE FUNCTION public.prevent_balance_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an admin making the change, let it pass (we check user_roles).
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- If it's not an admin, ensure balance, total_profit, etc. hasn't changed manually
  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    RAISE EXCEPTION 'Users cannot update their own balance directly.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_balance_manipulation ON public.profiles;
CREATE TRIGGER trg_prevent_balance_manipulation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_balance_manipulation();

-- Secure Wallets: The policy "Anyone authenticated can view active wallets" is fine.
-- Let's ensure deposits are secure: "Users can create own deposits" is fine, but they shouldn't be able to approve them.
-- `status` defaults to 'pending'. We should prevent users from updating the status of their own deposits.
-- Currently deposits have NO update policy for users, ONLY admins can update. This is perfectly secure.

-- secure.

-- PHASE 5: FINANCIAL INTEGRITY & BALANCE CALCULATIONS (CRITICAL FIX)
-- Create secure RPCs for processing deposits and withdrawals transactionally.

CREATE OR REPLACE FUNCTION public.process_deposit(p_deposit_id UUID, p_status public.request_status, p_admin_notes TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_deposit_amount NUMERIC;
  v_user_id UUID;
  v_current_status public.request_status;
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can process deposits';
  END IF;

  -- Lock the row and get details
  SELECT amount, user_id, status INTO v_deposit_amount, v_user_id, v_current_status
  FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;

  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Deposit is already processed';
  END IF;

  -- Update deposit
  UPDATE public.deposits 
  SET status = p_status, admin_notes = p_admin_notes, updated_at = now()
  WHERE id = p_deposit_id;

  -- Update balance if approved
  IF p_status = 'approved' THEN
    UPDATE public.profiles
    SET balance = balance + v_deposit_amount, updated_at = now()
    WHERE user_id = v_user_id;

    -- Insert into transactions for audit
    INSERT INTO public.transactions (user_id, type, amount, description, status, reference_id)
    VALUES (v_user_id, 'deposit', v_deposit_amount, 'Approved Deposit', 'completed', p_deposit_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal(p_withdrawal_id UUID, p_status public.request_status, p_admin_notes TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_withdrawal_amount NUMERIC;
  v_user_id UUID;
  v_current_status public.request_status;
  v_current_balance NUMERIC;
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can process withdrawals';
  END IF;

  -- Lock the row and get details
  SELECT amount, user_id, status INTO v_withdrawal_amount, v_user_id, v_current_status
  FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;

  IF v_current_status != 'pending' THEN
    RAISE EXCEPTION 'Withdrawal is already processed';
  END IF;

  -- Lock profile to check balance if approving
  SELECT balance INTO v_current_balance FROM public.profiles WHERE user_id = v_user_id FOR UPDATE;

  IF p_status = 'approved' THEN
    IF v_current_balance < v_withdrawal_amount THEN
      RAISE EXCEPTION 'Insufficient balance to approve this withdrawal';
    END IF;

    -- Deduct balance
    UPDATE public.profiles
    SET balance = balance - v_withdrawal_amount, updated_at = now()
    WHERE user_id = v_user_id;

    -- Insert into transactions for audit
    INSERT INTO public.transactions (user_id, type, amount, description, status, reference_id)
    VALUES (v_user_id, 'withdrawal', v_withdrawal_amount, 'Approved Withdrawal', 'completed', p_withdrawal_id);
  END IF;

  -- Update withdrawal
  UPDATE public.withdrawals 
  SET status = p_status, admin_notes = p_admin_notes, updated_at = now()
  WHERE id = p_withdrawal_id;

END;
$$;


-- PHASE 6: AUDIT LOGGING
-- Create table for tracking admin actions

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grant access
GRANT ALL ON TABLE public.admin_audit_logs TO authenticated;
GRANT ALL ON TABLE public.admin_audit_logs TO service_role;

