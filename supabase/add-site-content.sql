-- Site content (the admin panel's Content section) + the `marketing` role.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run.
--
-- Until this runs, the storefront keeps showing the built-in defaults
-- (lib/siteContent.ts) and saving in Admin → Content reports that the table
-- is missing. Nothing breaks either way.

-- 1. A third role. `marketing` can sign in to the admin panel and edit the
--    Content section only — products, prices and orders stay admin-only, and
--    that is enforced by every admin API route, not just by hiding tabs.
--    The original check was declared inline in schema.sql, so its name is
--    whatever Postgres generated; drop every role check by definition rather
--    than trusting the name, or the old one would survive and still reject
--    'marketing'.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin', 'marketing'));

-- 2. Live content: one row per editable section (announcement, home, about,
--    contact, seo). `content` is the whole section as JSON, validated by the
--    API route before it is written (lib/siteContentValidation.ts).
create table if not exists public.site_content (
  section    text primary key,
  content    jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- 3. Every save is also appended here, which is what the "History" panel lists
--    and restores from. Restoring re-saves an old version as a new one, so
--    history is never rewritten.
create table if not exists public.site_content_revisions (
  id               bigint generated always as identity primary key,
  section          text not null,
  content          jsonb not null,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id) on delete set null,
  created_by_email text
);

create index if not exists site_content_revisions_section_idx
  on public.site_content_revisions (section, created_at desc);

-- 4. RLS on, and no policies: nothing reaches these tables with the public
--    key. The storefront reads and the admin routes write through the
--    service-role key, which bypasses RLS, and only after a role check.
alter table public.site_content enable row level security;
alter table public.site_content_revisions enable row level security;

-- 5. Give someone the marketing role AFTER they have signed up on the site:
--    update public.profiles set role = 'marketing' where email = 'someone@example.com';
--
--    To take it away again:
--    update public.profiles set role = 'user' where email = 'someone@example.com';
