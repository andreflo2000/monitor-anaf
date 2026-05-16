-- Adaugă câmpul role în user_profiles (dacă nu există)
alter table public.user_profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin', 'owner'));

-- Setează owner pe contul tău (rulează o singură dată)
update public.user_profiles
set role = 'owner'
where email = 'florianparvu@yahoo.com';

-- Index pentru performanță
create index if not exists idx_user_profiles_role on public.user_profiles(role);
