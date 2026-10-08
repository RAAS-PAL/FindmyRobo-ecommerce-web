-- Migration: let the catalogue hold every robot we sell, not just Mammotion.
--
-- Prepares the products table for Gausium, T-Chef, Aventurier and Pudu, which
-- until now lived only in code (data/lineup.ts, data/modelPages.ts). ADDITIVE
-- ONLY: nothing is dropped, renamed or rewritten, existing rows keep their
-- values, and the live site keeps working before and after.
--
-- Checked against the live table on 2026-10-02: brand was missing
-- (add-product-brand.sql never ran). sku is left out on purpose for now
-- (add-product-sku.sql adds it when fulfilment needs it); the app works
-- without it.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Back up first: create table products_backup_<date> as select * from products;

begin;

-- 1. Manufacturer, per product (was add-product-brand.sql). Existing rows are
--    all Mammotion, which the default fills in.
alter table public.products
  add column if not exists brand text not null default 'Mammotion';

-- 2. How a product is sold: new, pre-owned, or both. Existing rows are new.
alter table public.products
  add column if not exists conditions text[] not null default '{new}';

alter table public.products
  drop constraint if exists products_conditions_check;
alter table public.products
  add constraint products_conditions_check
  check (
    cardinality(conditions) between 1 and 2
    and conditions <@ array['new', 'pre-owned']::text[]
  );

-- 3. Robot types beyond mowers. `variant` picks the fallback illustration and
--    the mower technology section; the new values are for the new families.
--    The original check constraint's name is whatever Postgres generated, so
--    find any check on this table that mentions `variant` and replace it.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.products'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%variant%'
  loop
    execute format('alter table public.products drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.products
  add constraint products_variant_check
  check (variant in (
    'luba', 'mini', 'pool', 'install', 'demo',
    'cleaner', 'delivery', 'cooking', 'equipment'
  ));

commit;

-- Check afterwards (read-only):
--   select id, name, brand, conditions, variant from products order by sort_order;
