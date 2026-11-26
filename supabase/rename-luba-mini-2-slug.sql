-- Fix the LUBA Mini 2 AWD 1500 storefront URL.
-- The product id doubles as the slug (/products/<id>), and this one was
-- 'luba-mini-awd-1500' — missing the generation "2", so the URL read like the
-- first-gen Mini. Rename the primary key in place.
--
-- Safe: order line-items are stored as snapshots (no foreign key to
-- products.id), so past orders are unaffected, and data/productAliases.ts
-- still counts them as a purchase of this product. The product name is
-- already "LUBA Mini 2 AWD 1500", so only the id/URL changes.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Order does
-- not matter: with data/productAliases.ts deployed, both addresses work
-- before and after, and the old one redirects to the new one.

update public.products
set id = 'luba-mini-2-awd-1500'
where id = 'luba-mini-awd-1500';
