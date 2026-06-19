-- Seed file to populate sample Traders and Wallets
-- (Note: There is currently no "plans" table in the database schema)

-- Insert sample TRADERS
INSERT INTO public.traders (id, name, bio, avatar_url, total_profit, win_rate, followers, is_active)
VALUES
  (
    gen_random_uuid(),
    'Alex Mercer',
    'Forex and commodities specialist with 10+ years of institutional trading experience.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    125430.50,
    86,
    14520,
    true
  ),
  (
    gen_random_uuid(),
    'Sophia Chen',
    'Crypto maximalist focused on high-yielding DeFi protocols and automated arbitrage.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    342900.00,
    91,
    28900,
    true
  ),
  (
    gen_random_uuid(),
    'Marcus Thorne',
    'Balanced portfolio management minimizing risk through diversified equity indices.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    89200.75,
    78,
    8450,
    true
  ),
  (
    gen_random_uuid(),
    'Elena Rostova',
    'Algorithmic trading expert specializing in high-frequency statistical arbitrage.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    210500.25,
    84,
    19200,
    true
  ),
  (
    gen_random_uuid(),
    'David Kim',
    'Swing trader focusing on momentum strategies across multiple crypto assets.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    65400.00,
    73,
    5100,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample WALLETS
INSERT INTO public.wallets (id, currency, network, address, exchange_rate, is_active, qr_code_url)
VALUES
  (
    gen_random_uuid(),
    'BTC',
    'Bitcoin Network',
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    65000.00,
    true,
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
  ),
  (
    gen_random_uuid(),
    'ETH',
    'ERC-20',
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    3500.00,
    true,
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  ),
  (
    gen_random_uuid(),
    'USDT',
    'TRC-20',
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    1.00,
    true,
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
  ),
  (
    gen_random_uuid(),
    'USDC',
    'ERC-20',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    1.00,
    true,
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  ),
  (
    gen_random_uuid(),
    'BNB',
    'BEP-20',
    '0xEeEeeeeEEEEEEEEEEEEeeeeEEeEEeeEEeEeEeeEe',
    600.00,
    true,
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0xEeEeeeeEEEEEEEEEEEEeeeeEEeEEeeEEeEeEeeEe'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample INVESTMENT PLANS
INSERT INTO public.investment_plans (id, name, description, min_amount, max_amount, duration_days, roi_percentage, is_active)
VALUES
  (
    gen_random_uuid(),
    'Starter Plan',
    'Perfect for beginners looking to test the waters with minimal risk.',
    100.00,
    999.00,
    7,
    5.5,
    true
  ),
  (
    gen_random_uuid(),
    'Silver Plan',
    'A balanced plan for consistent and steady portfolio growth.',
    1000.00,
    4999.00,
    14,
    12.0,
    true
  ),
  (
    gen_random_uuid(),
    'Gold Plan',
    'Designed for serious investors expecting substantial monthly returns.',
    5000.00,
    19999.00,
    30,
    28.5,
    true
  ),
  (
    gen_random_uuid(),
    'Diamond Plan',
    'Premium institutional-grade returns with dedicated account management.',
    20000.00,
    NULL,
    90,
    115.0,
    true
  )
ON CONFLICT (id) DO NOTHING;
