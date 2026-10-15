-- KettyBot (Admin -> Products -> pudu-ketty): add the owner's photos to its
-- page (2026-10-15).
--
-- Each photo goes with the section it shows:
--   "Your ads, on the move."        front view with the 18.5" ad screen, in a
--                                   softly blurred restaurant
--   "Greets, guides and delivers."  KettyBot serving in a restaurant
--   "Talks with guests."            close-up of the head (the round voice
--                                   module on top)
--   "Compact and sure-footed."      close-up of the base: the two RGBD depth
--                                   cameras the text mentions
--   "Recharges itself."             stays text-only: no photo shows the dock
-- The header keeps its three-quarter studio shot. The side view is not used:
-- it repeats the header and full-screen pages have no gallery.
--
-- The restaurant behind the ad-screen photo is from Unsplash (free licence):
-- photo by Raymond Yeung. Photos are on S3 (findmyrobo-media, Pudu/KettyBot/)
-- behind CloudFront. Only the image links change; each one is set only on the
-- section whose English heading matches, so nothing else edited in Admin is
-- touched. Safe to re-run.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = jsonb_set(page, '{blocks,0,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/KettyBot/KettyBot-ads.webp"')
where id = 'pudu-ketty' and page->'blocks'->0->'heading'->>'en' = 'Your ads, on the move.';

update public.products
set page = jsonb_set(page, '{blocks,1,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/KettyBot/KettyBot-greets.webp"')
where id = 'pudu-ketty' and page->'blocks'->1->'heading'->>'en' = 'Greets, guides and delivers.';

update public.products
set page = jsonb_set(page, '{blocks,2,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/KettyBot/KettyBot-voice.webp"')
where id = 'pudu-ketty' and page->'blocks'->2->'heading'->>'en' = 'Talks with guests.';

update public.products
set page = jsonb_set(page, '{blocks,3,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/KettyBot/KettyBot-sensors.webp"')
where id = 'pudu-ketty' and page->'blocks'->3->'heading'->>'en' = 'Compact and sure-footed.';

commit;

-- Check afterwards (read-only): four sections with a photo, one without.
--   select b->'heading'->>'en' as section, b->>'image' as photo
--   from products, jsonb_array_elements(page->'blocks') b where id = 'pudu-ketty';
--
-- Then open KettyBot in Admin -> Products and click Save (no change needed),
-- so the live page is rebuilt with the photos.
