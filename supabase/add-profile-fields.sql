-- FindMyRobo — customer profile self-service.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.

-- 1. Fields the customer can manage themselves.
--    phone            — default contact number, prefilled at checkout
--    marketing_opt_in — PDPA consent for marketing email. Defaults to FALSE:
--                       consent must be given, never assumed.
alter table public.profiles
  add column if not exists phone text,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  drop constraint if exists profiles_phone_format;
alter table public.profiles
  add constraint profiles_phone_format
  check (phone is null or phone ~ '^[0-9+\-\s()]{6,20}$');

-- 2. Let a customer update their OWN profile row.
--    The original schema deliberately had no update policy so nobody could
--    make themselves an admin. That protection is kept below by column-level
--    privileges — the policy alone would still allow writing `role`.
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. Column-level privileges: the ONLY columns a signed-in customer may write.
--    `role`, `id`, `email`, and `created_at` are absent on purpose. Even a
--    hand-crafted PostgREST call cannot escalate to admin.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, marketing_opt_in, updated_at)
  on public.profiles to authenticated;

-- 4. Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 5. Mirror email changes from auth.users into profiles.
--    Changing an email goes through Supabase Auth, which knows nothing about
--    this table — without this trigger profiles.email silently goes stale the
--    first time a customer changes their address.
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- 6. Deletion behaviour is already correct elsewhere and is relied on by
--    DELETE /api/account — recorded here so it does not get "tidied up":
--      profiles.id      -> auth.users on delete cascade  (profile removed)
--      addresses.user_id-> auth.users on delete cascade  (addresses removed)
--      reviews.user_id  -> auth.users on delete cascade  (reviews removed)
--      orders.user_id   -> auth.users on delete SET NULL (order KEPT, anonymised)
--    Orders must survive account deletion: Thai tax law requires retaining
--    sales records, and PDPA erasure does not override that. Setting user_id
--    to null severs the personal link while keeping the accounting record.
