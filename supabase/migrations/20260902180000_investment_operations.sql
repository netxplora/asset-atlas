-- ============================================================
-- USER INVESTMENT OPERATIONS
-- Full lifecycle: creation guard, daily ROI accrual, cancellation
-- ============================================================

-- ── 1. Ensure user_investments table is fully defined ─────────────────────────
CREATE TABLE IF NOT EXISTS public.user_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.investment_plans(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    roi_percentage NUMERIC NOT NULL,
    duration_days INTEGER NOT NULL,
    start_date TIMESTAMPTZ DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL,
    profit_generated NUMERIC DEFAULT 0,
    last_profit_update TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    penalty_amount NUMERIC DEFAULT 0,
    refunded_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Drop old policies to recreate cleanly
DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users can create own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Admins can manage all investments" ON public.user_investments;

-- User can only view their own investments
CREATE POLICY "Users can view own investments" ON public.user_investments
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create investments (status is forced to 'active' by trigger below)
CREATE POLICY "Users can create own investments" ON public.user_investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view and manage all investments
CREATE POLICY "Admins can manage all investments" ON public.user_investments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON public.user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON public.user_investments(status);
CREATE INDEX IF NOT EXISTS idx_user_investments_end_date ON public.user_investments(end_date);

-- ── 2. Trigger: Deduct balance on investment creation ─────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_investment_amount()
RETURNS TRIGGER AS $$
DECLARE
    user_balance NUMERIC;
BEGIN
    -- Force status to active on insert, ignore user-supplied status
    NEW.status := 'active';
    NEW.profit_generated := 0;
    NEW.start_date := now();

    -- Verify user has sufficient balance
    SELECT balance INTO user_balance
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    IF user_balance IS NULL OR user_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance. Available: %, Required: %', COALESCE(user_balance, 0), NEW.amount;
    END IF;

    -- Deduct the investment amount from the user's balance
    UPDATE public.profiles
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;

    -- Log a transaction record for the investment
    INSERT INTO public.transactions (user_id, type, amount, status, description)
    VALUES (NEW.user_id, 'investment', NEW.amount, 'completed',
            'Investment started - locked for ' || NEW.duration_days || ' days');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_deduct_investment_amount ON public.user_investments;
CREATE TRIGGER trg_deduct_investment_amount
BEFORE INSERT ON public.user_investments
FOR EACH ROW
EXECUTE FUNCTION public.deduct_investment_amount();

-- ── 3. Trigger: Update updated_at on modifications ────────────────────────────
DROP TRIGGER IF EXISTS update_user_investments_updated_at ON public.user_investments;
CREATE TRIGGER update_user_investments_updated_at
BEFORE UPDATE ON public.user_investments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ── 4. RPC: Accrue daily ROI for all active investments ───────────────────────
-- To be called by pg_cron: SELECT cron.schedule('daily-roi', '0 0 * * *', 'SELECT public.accrue_daily_roi()');
CREATE OR REPLACE FUNCTION public.accrue_daily_roi()
RETURNS JSON AS $$
DECLARE
    inv RECORD;
    daily_profit NUMERIC;
    total_processed INTEGER := 0;
    total_completed INTEGER := 0;
BEGIN
    FOR inv IN
        SELECT * FROM public.user_investments
        WHERE status = 'active'
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Calculate daily profit: total ROI spread evenly across duration
        daily_profit := (inv.amount * (inv.roi_percentage / 100.0)) / inv.duration_days;

        -- Credit profit to user's balance
        UPDATE public.profiles
        SET balance = balance + daily_profit,
            updated_at = now()
        WHERE user_id = inv.user_id;

        -- Update investment profit tracking
        UPDATE public.user_investments
        SET profit_generated = COALESCE(profit_generated, 0) + daily_profit,
            last_profit_update = now(),
            status = CASE WHEN end_date <= now() THEN 'completed' ELSE 'active' END,
            updated_at = now()
        WHERE id = inv.id;

        -- If investment just completed, log a transaction
        IF inv.end_date <= now() THEN
            INSERT INTO public.transactions (user_id, type, amount, status, description)
            VALUES (
                inv.user_id, 'return', inv.amount + (inv.amount * (inv.roi_percentage / 100.0)),
                'completed', 'Investment matured - principal + ROI returned'
            );
            -- Credit back the principal as well (profit already above, principal was locked)
            UPDATE public.profiles
            SET balance = balance + inv.amount,
                updated_at = now()
            WHERE user_id = inv.user_id;
            total_completed := total_completed + 1;
        END IF;

        total_processed := total_processed + 1;
    END LOOP;

    RETURN json_build_object(
        'processed', total_processed,
        'completed', total_completed,
        'run_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant to service_role only (called by pg_cron or Edge Functions)
REVOKE ALL ON FUNCTION public.accrue_daily_roi() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accrue_daily_roi() TO service_role;

-- ── 5. RPC: Cancel investment (user self-service) ────────────────────────────
-- 10% penalty on principal; all accrued profit forfeited.
CREATE OR REPLACE FUNCTION public.cancel_investment(p_investment_id UUID)
RETURNS JSON AS $$
DECLARE
    inv RECORD;
    penalty NUMERIC;
    refund NUMERIC;
BEGIN
    -- Fetch and lock the investment
    SELECT * INTO inv
    FROM public.user_investments
    WHERE id = p_investment_id
      AND user_id = auth.uid()
      AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Investment not found, already cancelled, or not owned by you.';
    END IF;

    -- Calculate penalty (10% of principal)
    penalty := inv.amount * 0.10;
    refund := inv.amount - penalty;

    -- Update investment status
    UPDATE public.user_investments
    SET status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = 'User requested cancellation',
        penalty_amount = penalty,
        refunded_amount = refund,
        updated_at = now()
    WHERE id = p_investment_id;

    -- Refund principal minus penalty to user's balance
    UPDATE public.profiles
    SET balance = balance + refund,
        updated_at = now()
    WHERE user_id = auth.uid();

    -- Log the cancellation transaction
    INSERT INTO public.transactions (user_id, type, amount, status, description)
    VALUES (
        auth.uid(), 'return', refund, 'completed',
        'Investment cancelled early. Penalty: $' || penalty::TEXT || '. Refunded: $' || refund::TEXT
    );

    -- Create a notification for the user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        auth.uid(),
        'Investment Cancelled',
        'Your investment of $' || inv.amount::TEXT || ' has been cancelled. A refund of $' || refund::TEXT || ' has been credited to your balance (10% penalty applied).',
        'system'
    );

    RETURN json_build_object(
        'success', true,
        'investment_id', p_investment_id,
        'penalty', penalty,
        'refunded', refund
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accessible to authenticated users only
REVOKE ALL ON FUNCTION public.cancel_investment(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_investment(UUID) TO authenticated;

-- ── 6. RPC: Admin force-cancel (no penalty) ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_cancel_investment(p_investment_id UUID, p_reason TEXT DEFAULT 'Admin cancelled')
RETURNS JSON AS $$
DECLARE
    inv RECORD;
BEGIN
    -- Admin only
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Admin access required.';
    END IF;

    SELECT * INTO inv
    FROM public.user_investments
    WHERE id = p_investment_id AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Investment not found or already inactive.';
    END IF;

    -- Full refund, no penalty
    UPDATE public.user_investments
    SET status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = p_reason,
        penalty_amount = 0,
        refunded_amount = inv.amount,
        updated_at = now()
    WHERE id = p_investment_id;

    -- Refund full principal
    UPDATE public.profiles
    SET balance = balance + inv.amount,
        updated_at = now()
    WHERE user_id = inv.user_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, type, amount, status, description)
    VALUES (inv.user_id, 'return', inv.amount, 'completed', 'Admin cancelled investment: ' || p_reason);

    -- Notify user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        inv.user_id,
        'Investment Cancelled by Support',
        'Your investment has been cancelled by our support team. Your full principal of $' || inv.amount::TEXT || ' has been refunded. Reason: ' || p_reason,
        'system'
    );

    RETURN json_build_object('success', true, 'refunded', inv.amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.admin_cancel_investment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cancel_investment(UUID, TEXT) TO authenticated;
