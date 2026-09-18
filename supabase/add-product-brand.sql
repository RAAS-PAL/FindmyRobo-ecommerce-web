-- Migration: product manufacturer brand.
--
-- Feeds the Product structured data (JSON-LD) on every product page. Brand is
-- a claim Google can check against the manufacturer's own site, so it must be
-- per product — a hardcoded "Mammotion" would silently mislabel the first
-- non-Mammotion robot added, with no error, and structured-data mismatches are
-- treated as a penalty rather than a bug.
--
-- Defaults to Mammotion because the entire launch lineup is Mammotion; existing
-- rows are backfilled by the default, and the admin form pre-fills it, so
-- nothing has to be typed until a second brand actually arrives.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- The app degrades gracefully before this runs (see DEGRADABLE_COLUMNS in
-- lib/productStore.ts): saves succeed, brand just isn't stored yet.

alter table public.products
  add column if not exists brand text not null default 'Mammotion';
