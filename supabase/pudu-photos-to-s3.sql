-- Point BellaBot's and PuduBot 2's feature photos at S3 instead of the website.
--
-- fill-pudu-pages.sql first linked the photos to files shipped with the site
-- (/models/pudu/bellabot/..., /models/pudu/pudubot2/...). The same photos are
-- now in the findmyrobo-media bucket, served through CloudFront, like every
-- other product photo. This swaps only those links, so anything edited in
-- Admin since (texts, price, visibility) stays as it is.
--
-- Run ONLY after the photos are in S3 (each CloudFront link below must open).
-- Safe to re-run: once swapped, there is nothing left to replace.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = replace(
  page::text,
  '"/models/pudu/bellabot/',
  '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-'
)::jsonb
where id = 'pudu-bella'
  and page::text like '%"/models/pudu/bellabot/%';

update public.products
set page = replace(
  page::text,
  '"/models/pudu/pudubot2/',
  '"https://d5hk9n8my7l32.cloudfront.net/Pudu/PuduBot2/PuduBot2-'
)::jsonb
where id = 'pudu-2'
  and page::text like '%"/models/pudu/pudubot2/%';

commit;

-- Check afterwards (read-only): both 0 = done.
--   select id, (length(page::text) - length(replace(page::text, '/models/pudu/', ''))) / 13 as website_links_left
--   from products where id in ('pudu-bella', 'pudu-2');
--
-- Then save each of the two products once in Admin -> Products (no change
-- needed), so the live pages are rebuilt with the new links.
