-- User profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tier text not null default 'free' check (tier in ('free', 'starter', 'pro', 'agency')),
  stripe_customer_id text,
  created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
create policy "Users see own profile" on public.user_profiles
  for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, tier)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Monitored companies
create table if not exists public.monitored_companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cui text not null,
  name text not null default '',
  created_at timestamptz default now(),
  unique(user_id, cui)
);

alter table public.monitored_companies enable row level security;
create policy "Users manage own companies" on public.monitored_companies
  for all using (auth.uid() = user_id);

-- Company ANAF status (shared, one row per CUI)
create table if not exists public.company_status (
  cui text primary key,
  tva_activ boolean,
  inactiv boolean,
  are_datorii boolean,
  last_checked timestamptz,
  data jsonb
);

-- No RLS on company_status — read by service role only via API

-- Alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.monitored_companies(id) on delete set null,
  cui text not null,
  company_name text not null,
  changes text[] not null,
  created_at timestamptz default now()
);

alter table public.alerts enable row level security;
create policy "Users see own alerts" on public.alerts
  for all using (auth.uid() = user_id);

-- Cron logs
create table if not exists public.cron_logs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz default now(),
  companies_checked integer default 0,
  alerts_sent integer default 0,
  duration_ms integer,
  status text,
  error text
);
