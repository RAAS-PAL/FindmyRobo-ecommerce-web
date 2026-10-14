-- BellaBot (Admin -> Products -> pudu-bella): full-quality photos, and the
-- right picture for each section (the owner's files, 2026-10-14).
--
--   "Finds its own way."         Pudu's LiDAR + camera scan clip, playing on a
--                                loop (was a plain front view that didn't show
--                                navigation)
--   "Sees obstacles in 3D."      sharp close-up of the RGBD cameras
--   "A cat people come back to"  the two-robot scene at full resolution
--   "Four trays, 40 kg a trip."  front view showing all four trays (was the
--                                glowing tray edges)
--   "Soup stays in the bowl."    the suspension render at full quality
--   Battery and Calling are unchanged.
--
-- Pudu logos and the award badge are painted out. All files are on S3
-- (findmyrobo-media, Pudu/BellaBot/*-hd.webp, BellaBot-navigation-web.mp4).
-- Each link is set only on the section whose English heading matches, so
-- nothing else edited in Admin is touched. Safe to re-run.
--
-- Needs the site code that plays .mp4 sections (components/product/
-- ShowcasePage.tsx, 2026-10-14) to be live first; before that, the
-- navigation section would show an empty frame.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = jsonb_set(page, '{blocks,0,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-navigation-web.mp4"')
where id = 'pudu-bella' and page->'blocks'->0->'heading'->>'en' = 'Finds its own way.';

update public.products
set page = jsonb_set(page, '{blocks,1,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-sensors-hd.webp"')
where id = 'pudu-bella' and page->'blocks'->1->'heading'->>'en' = 'Sees obstacles in 3D.';

update public.products
set page = jsonb_set(page, '{blocks,2,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-guests-hd.webp"')
where id = 'pudu-bella' and page->'blocks'->2->'heading'->>'en' = 'A cat people come back to see.';

update public.products
set page = jsonb_set(page, '{blocks,3,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-trays-hd.webp"')
where id = 'pudu-bella' and page->'blocks'->3->'heading'->>'en' = 'Four trays, 40 kg a trip.';

update public.products
set page = jsonb_set(page, '{blocks,4,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/BellaBot/BellaBot-suspension-hd.webp"')
where id = 'pudu-bella' and page->'blocks'->4->'heading'->>'en' = 'Soup stays in the bowl.';

commit;

-- Check afterwards (read-only):
--   select b->'heading'->>'en' as section, b->>'image' as media
--   from products, jsonb_array_elements(page->'blocks') b where id = 'pudu-bella';
--
-- Then open BellaBot in Admin -> Products and click Save (no change needed),
-- so the live page is rebuilt.
