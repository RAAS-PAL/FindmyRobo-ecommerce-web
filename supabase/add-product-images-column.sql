-- Migration: product gallery photos
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Adds the extra gallery photos shown on the product detail page. image_url
-- stays the main/card photo; this holds the ones after it, in order.
-- Safe to re-run.
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;
