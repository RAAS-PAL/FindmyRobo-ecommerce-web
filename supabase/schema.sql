-- RoboMart TH — auth schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE where possible).

-- 1. Profiles: one row per auth user, carrying the role.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  -- 'marketing' was added by add-site-content.sql (Content section only).
  role       text not null default 'user' check (role in ('user', 'admin', 'marketing')),
  created_at timestamptz not null default now()
);

-- 2. Row-level security: a user may read ONLY their own profile.
--    No update policy on purpose — role can't be changed from the app
--    (prevents a customer making themselves admin). Admin/service reads
--    use the SECRET key, which bypasses RLS.
alter table public.profiles enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read"
  on public.profiles for select
  using (auth.uid() = id);

-- 3. Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. AFTER you sign up your own account through the site, make it the admin:
--    update public.profiles set role = 'admin' where email = 'gptraaspal@gmail.com';
