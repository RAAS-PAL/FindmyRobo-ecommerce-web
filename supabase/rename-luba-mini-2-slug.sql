-- Fix the LUBA Mini 2 AWD 1500 storefront URL.
-- The product id doubles as the slug (/products/<id>), and this one was
-- 'luba-mini-awd-1500' — missing the generation "2", so the URL read like the
-- first-gen Mini. Rename the primary key in place.
--
-- Safe: order line-items are stored as snapshots (no foreign key to
-- products.id), so past orders are unaffected. The product name is already
-- "LUBA Mini 2 AWD 1500", so only the id/URL changes.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- NOTE: the old URL /en/products/luba-mini-awd-1500 will 404 afterwards.

update public.products
set id = 'luba-mini-2-awd-1500'
where id = 'luba-mini-awd-1500';
