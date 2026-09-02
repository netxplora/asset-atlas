-- Add category column to investment_plans table
ALTER TABLE public.investment_plans
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Forex';

-- Add a check constraint for allowed categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'investment_plans_category_check'
  ) THEN
    ALTER TABLE public.investment_plans
      ADD CONSTRAINT investment_plans_category_check
      CHECK (category IN ('Forex', 'Crypto', 'Commodities'));
  END IF;
END$$;

-- Mark existing generic plans as Forex
UPDATE public.investment_plans
  SET category = 'Forex'
  WHERE category IS NULL OR category = '' OR category = 'Forex';

-- Remove old generic plans that have no category intent
-- (they will be replaced by the structured seed data below)
DELETE FROM public.investment_plans
  WHERE category = 'Forex'
    AND name IN ('Starter Plan', 'Silver Plan', 'Gold Plan', 'Diamond Plan');

-- ─── FOREX PLANS ──────────────────────────────────────────────
INSERT INTO public.investment_plans (name, category, description, min_amount, max_amount, duration_days, roi_percentage, is_active)
VALUES
  ('Forex Starter',    'Forex', 'Entry-level Forex plan for new investors in currency markets.',            100.00,    999.00,  30,  8.0,  true),
  ('Forex Silver',     'Forex', 'Intermediate Forex plan for consistent capital growth.',                 1000.00,   4999.00,  60, 12.0,  true),
  ('Forex Gold',       'Forex', 'Advanced Forex allocation for experienced currency investors.',           5000.00,  24999.00,  90, 18.0,  true),
  ('Forex Elite',      'Forex', 'High-net-worth long-term Forex strategy with maximum exposure.',        25000.00,     NULL,  180, 25.0,  true)
ON CONFLICT DO NOTHING;

-- ─── CRYPTO PLANS ─────────────────────────────────────────────
INSERT INTO public.investment_plans (name, category, description, min_amount, max_amount, duration_days, roi_percentage, is_active)
VALUES
  ('Crypto Starter',   'Crypto', 'Entry point into digital asset markets with managed exposure.',           250.00,   2499.00,  30, 10.0,  true),
  ('Crypto Silver',    'Crypto', 'Balanced crypto allocation across top-cap digital assets.',              2500.00,   9999.00,  60, 15.0,  true),
  ('Crypto Gold',      'Crypto', 'High-yield crypto strategy for experienced digital asset investors.',   10000.00,  49999.00,  90, 22.0,  true),
  ('Crypto Elite',     'Crypto', 'Institutional-scale crypto allocation with active portfolio management.',50000.00,    NULL,  180, 30.0,  true)
ON CONFLICT DO NOTHING;

-- ─── COMMODITIES PLANS ────────────────────────────────────────
INSERT INTO public.investment_plans (name, category, description, min_amount, max_amount, duration_days, roi_percentage, is_active)
VALUES
  ('Commodities Starter',    'Commodities', 'Conservative commodities plan ideal for capital preservation.',          500.00,   2999.00,  30,  6.0,  true),
  ('Commodities Silver',     'Commodities', 'Diversified physical asset allocation for long-term portfolio growth.', 3000.00,  14999.00,  60, 10.0,  true),
  ('Commodities Gold',       'Commodities', 'Balanced precious metals and energy commodities strategy.',            15000.00,  74999.00,  90, 15.0,  true),
  ('Commodities Elite',      'Commodities', 'High-net-worth commodities portfolio with dedicated allocation.',      75000.00,     NULL,  180, 20.0,  true)
ON CONFLICT DO NOTHING;

-- Index for fast category-based filtering
CREATE INDEX IF NOT EXISTS idx_investment_plans_category
  ON public.investment_plans(category);
