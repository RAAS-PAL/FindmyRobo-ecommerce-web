-- PuduBot (Admin -> Products -> pudu-1): add the owner's photos to its page.
--
-- Each photo goes with the section it shows:
--   "Three big trays."     front three-quarter studio shot, all three trays
--   "Finds its own way."   in a narrow aisle between desks, carrying boxes
--                          (the 60 cm passage the text mentions)
--   "Steady trays."        side view: the base, wheel and frame
--   "Modes for service."   stays text-only: no photo shows the modes
-- The rear studio shot is not used: full-screen pages have no gallery, and
-- no section is about the back of the robot.
--
-- Photos are on S3 (findmyrobo-media, Pudu/PuduBot/) behind CloudFront.
-- Only the image links change; each one is set only on the section whose
-- English heading matches, so nothing else edited in Admin is touched.
-- Safe to re-run.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = jsonb_set(page, '{blocks,0,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/PuduBot/PuduBot-trays.webp"')
where id = 'pudu-1' and page->'blocks'->0->'heading'->>'en' = 'Three big trays.';

update public.products
set page = jsonb_set(page, '{blocks,1,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/PuduBot/PuduBot-aisle.webp"')
where id = 'pudu-1' and page->'blocks'->1->'heading'->>'en' = 'Finds its own way.';

update public.products
set page = jsonb_set(page, '{blocks,2,image}', '"https://d5hk9n8my7l32.cloudfront.net/Pudu/PuduBot/PuduBot-side.webp"')
where id = 'pudu-1' and page->'blocks'->2->'heading'->>'en' = 'Steady trays.';

commit;

-- Check afterwards (read-only): three sections with a photo, one without.
--   select b->'heading'->>'en' as section, b->>'image' as photo
--   from products, jsonb_array_elements(page->'blocks') b where id = 'pudu-1';
--
-- Then open PuduBot in Admin -> Products and click Save (no change needed),
-- so the live page is rebuilt with the photos.
