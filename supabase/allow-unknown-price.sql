-- Migration: a product may have no price yet.
--
-- We sell by quotation and don't know every robot's price, so `price` can now
-- be empty (null). The site shows such a product as "Price on request" and
-- keeps it out of the cart and checkout. A price that IS set must still be
-- above 0 (the existing check allows null).
--
-- Run BEFORE seed-lineup-robots.sql, so its robots can go in without prices.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Back up first: create table products_backup_<date> as select * from products;

alter table public.products
  alter column price drop not null;

-- Check afterwards (read-only): is_nullable should be YES.
--   select column_name, is_nullable from information_schema.columns
--   where table_name = 'products' and column_name = 'price';
