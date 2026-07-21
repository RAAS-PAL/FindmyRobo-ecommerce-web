-- Migration: product visibility (hide from the storefront without deleting)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Lets the admin stage a phased launch — e.g. show only mowers now, reveal
-- pool cleaners later — while every product's data stays in the database.
--
-- Default true so nothing already in the catalog disappears when this runs;
-- flip individual products to false from the admin panel to hide them.
alter table public.products
  add column if not exists visible boolean not null default true;
