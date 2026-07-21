-- RoboStore TH — saved customer delivery addresses.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null check (char_length(label) between 1 and 60),
  full_name   text not null,
  email       text not null,
  phone       text not null,
  address     text not null,
  district    text not null,
  province    text not null,
  postal_code text not null check (postal_code ~ '^\d{5}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Foreign-key columns are not indexed automatically in Postgres.
create index if not exists addresses_user_id_idx
  on public.addresses (user_id, created_at desc);

-- At most one default delivery address per customer.
create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses (user_id)
  where is_default;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists addresses_touch_updated_at on public.addresses;
create trigger addresses_touch_updated_at
  before update on public.addresses
  for each row execute function public.touch_updated_at();

alter table public.addresses enable row level security;

drop policy if exists "own addresses read" on public.addresses;
create policy "own addresses read"
  on public.addresses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own addresses insert" on public.addresses;
create policy "own addresses insert"
  on public.addresses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "own addresses update" on public.addresses;
create policy "own addresses update"
  on public.addresses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own addresses delete" on public.addresses;
create policy "own addresses delete"
  on public.addresses for delete
  to authenticated
  using ((select auth.uid()) = user_id);
