-- Migration: what the robot recommender (/recommend) needs.
--
-- 1. products.fit — the numbers the recommender matches on (max area, max
--    slope, cleaning rate, how a floor cleaner runs). Edited in Admin ->
--    Products -> "Recommendation facts". Mowers can leave it empty: their
--    coverage-area and slope specs are used instead.
-- 2. recommendation_requests — every finished questionnaire: the answers, the
--    robots shown, and (only if the customer sends them, with consent) their
--    contact details. A lead list for sales.
-- 3. Facts for the robots whose spec sheets give them (see data/modelPages.ts
--    for the sources): Phantas from Gausium's sheet, A1-Basic and A1-Youth
--    from the Artist 1 brochure (one table for the A1 family). Pudu and T-Chef
--    have nothing the questions use yet.
--
-- ADDITIVE ONLY. Run after seed-lineup-robots.sql (step 3 needs those rows;
-- it skips any that aren't there yet, so re-running later fills them in).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.

begin;

-- 1. Recommender facts per product.
alter table public.products
  add column if not exists fit jsonb not null default '{}'::jsonb;

-- 2. Questionnaires and the leads they bring.
create table if not exists public.recommendation_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  locale        text not null default 'th',
  answers       jsonb not null,               -- what the customer chose
  results       text[] not null default '{}', -- product ids shown, best first
  -- filled only when the customer asks to be contacted, with consent
  contact_name  text,
  contact_phone text,
  contact_email text,
  contact_note  text,
  consent_at    timestamptz,
  contacted_at  timestamptz
);

create index if not exists recommendation_requests_created_idx
  on public.recommendation_requests (created_at desc);

-- Only the server (service role) reads or writes it: RLS on, no policies.
alter table public.recommendation_requests enable row level security;

-- 3. Facts from the manufacturers' sheets.
update public.products
set fit = fit || '{"cleaningRateM2h": 700, "operation": "autonomous"}'::jsonb
where id = 'gausium-phantas';

update public.products
set fit = fit || '{"cleaningRateM2h": 1200, "operation": "walk-behind"}'::jsonb
where id in ('aventurier-a1-basic', 'aventurier-a1-youth');

commit;

-- Check afterwards (read-only):
--   select id, name, fit from products order by sort_order;
--   select count(*) from recommendation_requests;
