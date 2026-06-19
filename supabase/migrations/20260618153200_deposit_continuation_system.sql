-- Create deposit audit logs table
CREATE TABLE IF NOT EXISTS public.deposit_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for deposit audit logs
ALTER TABLE public.deposit_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposit audit logs" 
  ON public.deposit_audit_logs FOR SELECT 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.deposit_audit_logs FOR INSERT
  WITH CHECK (true);

-- Create deposit intents table
CREATE TABLE IF NOT EXISTS public.deposit_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deposit_method TEXT NOT NULL,
  selected_currency TEXT NOT NULL,
  selected_network TEXT,
  wallet_address TEXT NOT NULL,
  amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'Awaiting Payment',
  initiated_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  tx_hash TEXT,
  amount_sent NUMERIC,
  screenshot_url TEXT,
  user_notes TEXT,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  reminder_30m_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_24h_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_72h_sent BOOLEAN NOT NULL DEFAULT false,
  deposit_id UUID REFERENCES public.deposits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for deposit intents
ALTER TABLE public.deposit_intents ENABLE ROW LEVEL SECURITY;

-- Create policies for deposit intents
CREATE POLICY "Users can view own deposit intents" 
  ON public.deposit_intents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposit intents" 
  ON public.deposit_intents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deposit intents" 
  ON public.deposit_intents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all deposit intents" 
  ON public.deposit_intents FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- B-Tree indexes for optimization
CREATE INDEX IF NOT EXISTS idx_deposit_intents_user_id ON public.deposit_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_intents_deposit_id ON public.deposit_intents(deposit_id);
CREATE INDEX IF NOT EXISTS idx_deposit_intents_status ON public.deposit_intents(status);

-- Trigger to automatically update updated_at column
CREATE TRIGGER update_deposit_intents_updated_at 
  BEFORE UPDATE ON public.deposit_intents 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for audit logging on deposit intents
CREATE OR REPLACE FUNCTION public.log_deposit_intent_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deposit_audit_logs (intent_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.user_id,
      'INITIATE',
      jsonb_build_object('status', NEW.status, 'amount', NEW.amount, 'currency', NEW.selected_currency, 'method', NEW.deposit_method)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.deposit_audit_logs (intent_id, user_id, action, details)
    VALUES (
      NEW.id,
      NEW.user_id,
      'STATUS_CHANGE',
      jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status, 'updated_by', auth.uid())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_log_deposit_intent_change
  AFTER INSERT OR UPDATE ON public.deposit_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deposit_intent_change();

-- Trigger to sync status updates from deposits to deposit intents
CREATE OR REPLACE FUNCTION public.sync_deposit_intent_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.deposit_intents
  SET 
    status = CASE 
      WHEN NEW.status = 'approved' THEN 'Approved'
      WHEN NEW.status = 'rejected' THEN 'Rejected'
      ELSE 'Pending Verification'
    END,
    last_activity_timestamp = now(),
    updated_at = now()
  WHERE deposit_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_deposit_intent_status
  AFTER UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_deposit_intent_status();

-- Prevention trigger for duplicate Tx Hashes on deposits
CREATE OR REPLACE FUNCTION public.prevent_duplicate_tx_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tx_hash IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.deposits 
    WHERE tx_hash = NEW.tx_hash AND id != NEW.id AND status != 'rejected'
  ) THEN
    RAISE EXCEPTION 'This transaction hash has already been submitted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_prevent_duplicate_tx_hash
  BEFORE INSERT OR UPDATE OF tx_hash ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_tx_hash();

-- Prevention trigger for duplicate Tx Hashes on deposit intents
CREATE OR REPLACE FUNCTION public.prevent_duplicate_intent_tx_hash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tx_hash IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.deposit_intents 
    WHERE tx_hash = NEW.tx_hash AND id != NEW.id AND status NOT IN ('Cancelled', 'Expired')
  ) THEN
    RAISE EXCEPTION 'This transaction hash is already linked to another deposit intent.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_prevent_duplicate_intent_tx_hash
  BEFORE UPDATE OF tx_hash ON public.deposit_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_intent_tx_hash();

-- User cancellation RPC
CREATE OR REPLACE FUNCTION public.cancel_deposit_intent(p_intent_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
BEGIN
  -- Fetch intent status and owner
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.deposit_intents WHERE id = p_intent_id FOR UPDATE;

  -- Verify owner or admin
  IF auth.uid() != v_user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Ensure it's not already processed
  IF v_status NOT IN ('Awaiting Payment', 'Awaiting Confirmation') THEN
    RAISE EXCEPTION 'Cannot cancel a deposit intent that is already processed';
  END IF;

  -- Update status to Cancelled
  UPDATE public.deposit_intents
  SET 
    status = 'Cancelled',
    last_activity_timestamp = now(),
    updated_at = now()
  WHERE id = p_intent_id;

  -- Create notification for cancellation
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Deposit Cancelled',
    'Your deposit process has been cancelled.',
    'deposit'::public.notification_type
  );

  -- Log action
  INSERT INTO public.deposit_audit_logs (intent_id, user_id, action, details)
  VALUES (
    p_intent_id,
    auth.uid(),
    'CANCEL',
    jsonb_build_object('previous_status', v_status, 'cancelled_by', auth.uid())
  );
END;
$$;

-- Lifecycle check function (handles 30m, 24h, 72h reminders and 7-day expiration)
CREATE OR REPLACE FUNCTION public.check_deposit_intents_lifecycle()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- 1. Expiration Rules (7 days)
  -- If status is 'Awaiting Payment' or 'Awaiting Confirmation' and no activity for 7 days, set to 'Expired'
  UPDATE public.deposit_intents
  SET status = 'Expired', last_activity_timestamp = now(), updated_at = now()
  WHERE status IN ('Awaiting Payment', 'Awaiting Confirmation')
    AND last_activity_timestamp < now() - INTERVAL '7 days';

  -- 2. 30-minute reminder
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    user_id, 
    'Unfinished Deposit Process', 
    'You started a cryptocurrency purchase but have not yet submitted your transaction details. Complete your deposit to avoid delays.', 
    'deposit'::public.notification_type
  FROM public.deposit_intents
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_30m_sent
    AND initiated_timestamp < now() - INTERVAL '30 minutes';

  UPDATE public.deposit_intents
  SET reminder_30m_sent = true, last_activity_timestamp = now(), updated_at = now()
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_30m_sent
    AND initiated_timestamp < now() - INTERVAL '30 minutes';

  -- 3. 24-hour reminder
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    user_id, 
    'Reminder: Complete your deposit', 
    'You started a cryptocurrency purchase but have not yet submitted your transaction details. Complete your deposit to avoid delays.', 
    'deposit'::public.notification_type
  FROM public.deposit_intents
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_24h_sent
    AND initiated_timestamp < now() - INTERVAL '24 hours';

  UPDATE public.deposit_intents
  SET reminder_24h_sent = true, last_activity_timestamp = now(), updated_at = now()
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_24h_sent
    AND initiated_timestamp < now() - INTERVAL '24 hours';

  -- 4. 72-hour reminder
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT 
    user_id, 
    'Final Reminder: Complete your deposit', 
    'You started a cryptocurrency purchase but have not yet submitted your transaction details. Complete your deposit to avoid delays.', 
    'deposit'::public.notification_type
  FROM public.deposit_intents
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_72h_sent
    AND initiated_timestamp < now() - INTERVAL '72 hours';

  UPDATE public.deposit_intents
  SET reminder_72h_sent = true, last_activity_timestamp = now(), updated_at = now()
  WHERE status = 'Awaiting Payment'
    AND NOT reminder_72h_sent
    AND initiated_timestamp < now() - INTERVAL '72 hours';
END;
$$;
