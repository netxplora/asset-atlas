-- Create investment_plans table
CREATE TABLE IF NOT EXISTS public.investment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    min_amount NUMERIC NOT NULL,
    max_amount NUMERIC,
    duration_days INTEGER NOT NULL,
    roi_percentage NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Note: user_investments table could be added here if needed, 
-- but this covers the core "plans" configuration

-- Enable RLS
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

-- Policies for investment_plans
CREATE POLICY "Enable read access for all users" ON public.investment_plans
    FOR SELECT USING (true);

CREATE POLICY "Enable all metadata access for admins" ON public.investment_plans
    FOR ALL USING (has_role('admin', auth.uid()));

-- Add Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investment_plans_modtime
    BEFORE UPDATE ON public.investment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
