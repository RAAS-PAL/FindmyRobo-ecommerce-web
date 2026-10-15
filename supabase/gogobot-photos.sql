-- GoGoBot (Admin -> Products -> yunji-gogobot): add the owner's photos to its
-- page (2026-10-15).
--
-- Each photo goes with the section it shows:
--   "Two cabins, 71 litres."        closed robot beside one with both cabins
--                                   open and lit, sizes on each cabin (was
--                                   four plain views of the outside)
--   "Made for lifts and corridors." GoGoBot in a hotel corridor
--   Fingerprint, feet sensors and lift/vending links stay text-only: no
--   photo shows them closely enough.
-- The owner's cabin photo said "40L" for the upper cabin; Yunji's spec says
-- 41 L (its own 320 x 315 x 409 mm works out to 41.2 L), so the label was
-- redrawn as 41 L to match the page.
--
-- The corridor is from Unsplash (free licence): photo by Alex Naino. Photos
-- are on S3 (findmyrobo-media, Yunji/GoGoBot/) behind CloudFront. Only the
-- image links change; each one is set only on the section whose English
-- heading matches, so nothing else edited in Admin is touched. Safe to re-run.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = jsonb_set(page, '{blocks,0,image}', '"https://d5hk9n8my7l32.cloudfront.net/Yunji/GoGoBot/GoGoBot-cabins-hq.webp"')
where id = 'yunji-gogobot' and page->'blocks'->0->'heading'->>'en' = 'Two cabins, 71 litres.';

update public.products
set page = jsonb_set(page, '{blocks,1,image}', '"https://d5hk9n8my7l32.cloudfront.net/Yunji/GoGoBot/GoGoBot-corridor.webp"')
where id = 'yunji-gogobot' and page->'blocks'->1->'heading'->>'en' = 'Made for lifts and corridors.';

commit;

-- Check afterwards (read-only): two sections with a photo, three without.
--   select b->'heading'->>'en' as section, b->>'image' as photo
--   from products, jsonb_array_elements(page->'blocks') b where id = 'yunji-gogobot';
--
-- Then open GoGoBot in Admin -> Products and click Save (no change needed),
-- so the live page is rebuilt with the photos.
