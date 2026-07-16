-- Migration: rich product detail pages (admin page builder)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Adds the jsonb column that stores each product's detail-page content
-- (video, ordered content blocks, grouped spec table). Safe to re-run.
alter table public.products add column if not exists page jsonb;
