-- ============================================================
-- FULL PLATFORM SECURITY HARDENING
-- ============================================================

-- 1. PROFILE HARDENING: Prevent Vertical Privilege Escalation
-- Ensure users cannot update their own role or kyc_status
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an admin making the change, let it pass.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Ensure sensitive fields have not changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role = OLD.role;
  END IF;
  
  IF NEW.kyc_status IS DISTINCT FROM OLD.kyc_status THEN
    NEW.kyc_status = OLD.kyc_status;
  END IF;
  
  -- The previously existing trg_prevent_balance_manipulation handles balance,
  -- but we'll also enforce it here just in case, ensuring balance remains unmodified.
  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    NEW.balance = OLD.balance;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_escalation();

-- 2. FINANCIAL STATUS HARDENING: Prevent State Spoofing on Deposits
CREATE OR REPLACE FUNCTION public.prevent_deposit_spoofing()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an admin making the change, let it pass.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- If this is an insert, force status to pending.
  IF TG_OP = 'INSERT' THEN
    NEW.status = 'pending';
  -- If update, prevent modifying the status or amount
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.status = OLD.status;
    END IF;
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      NEW.amount = OLD.amount;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_deposit_spoofing ON public.deposits;
CREATE TRIGGER trg_prevent_deposit_spoofing
BEFORE INSERT OR UPDATE ON public.deposits
FOR EACH ROW
EXECUTE FUNCTION public.prevent_deposit_spoofing();

-- 3. FINANCIAL STATUS HARDENING: Prevent State Spoofing on Withdrawals
CREATE OR REPLACE FUNCTION public.prevent_withdrawal_spoofing()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an admin making the change, let it pass.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- If this is an insert, force status to pending.
  IF TG_OP = 'INSERT' THEN
    NEW.status = 'pending';
  -- If update, prevent modifying the status or amount
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.status = OLD.status;
    END IF;
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      NEW.amount = OLD.amount;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_withdrawal_spoofing ON public.withdrawals;
CREATE TRIGGER trg_prevent_withdrawal_spoofing
BEFORE INSERT OR UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.prevent_withdrawal_spoofing();

-- 4. NOTIFICATION HARDENING: Prevent Notification Spoofing
CREATE OR REPLACE FUNCTION public.prevent_notification_spoofing()
RETURNS TRIGGER AS $$
BEGIN
  -- Admin or system (service_role) can do anything
  IF public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- On UPDATE, users can only change is_read status
  IF TG_OP = 'UPDATE' THEN
    IF NEW.title IS DISTINCT FROM OLD.title THEN
      NEW.title = OLD.title;
    END IF;
    IF NEW.message IS DISTINCT FROM OLD.message THEN
      NEW.message = OLD.message;
    END IF;
    IF NEW.type IS DISTINCT FROM OLD.type THEN
      NEW.type = OLD.type;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_notification_spoofing ON public.notifications;
CREATE TRIGGER trg_prevent_notification_spoofing
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.prevent_notification_spoofing();

-- Ensure users cannot spoof system notifications on insert
CREATE OR REPLACE FUNCTION public.prevent_system_notification_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.type IN ('system', 'deposit', 'withdrawal', 'security') THEN
    RAISE EXCEPTION 'Users cannot create system-level notifications';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_system_notification_insert ON public.notifications;
CREATE TRIGGER trg_prevent_system_notification_insert
BEFORE INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.prevent_system_notification_insert();
