-- Migration: stop the public reading the products table straight from Supabase.
--
-- products-schema.sql used to add the policy "public catalog read" (select,
-- using true). The publishable key ships in every page of the site, so with
-- that policy anyone could call Supabase's REST API directly
--   GET <supabase url>/rest/v1/products?select=id,price
-- and get every price — hidden products too — even in quotation mode, when the
-- site itself shows none.
--
-- The site never needed the policy: lib/productStore.ts reads and writes
-- products only with the secret (service-role) key, which bypasses RLS. With
-- RLS on and no policy, the publishable key gets no rows and the site works as
-- before.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Nothing to back up: it changes who may read, not any data.

alter table public.products enable row level security;

drop policy if exists "public catalog read" on public.products;

-- Check afterwards (read-only): no rows means no policy is left on products.
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'products';
