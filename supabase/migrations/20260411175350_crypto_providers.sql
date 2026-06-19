create table if not exists public.crypto_providers (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  provider_url text not null,
  description text,
  priority integer default 1,
  status boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set up RLS
alter table public.crypto_providers enable row level security;

create policy "Users can view active crypto providers"
  on public.crypto_providers
  for select
  using (status = true);

create policy "Admins can view and manage all crypto providers"
  on public.crypto_providers
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );
