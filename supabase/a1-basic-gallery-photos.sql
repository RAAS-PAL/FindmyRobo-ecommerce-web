-- A1-Basic (Admin -> Products -> aventurier-a1-basic): photos from
-- Aventurier's gallery (aventurieraustralia.com.au/gallery), 2026-10-20.
--
-- Photos only: the page's text and specs stay as they are.
--   Header                  shows it in grey (the owner's photo) and white,
--                           like the A1-Youth page
--   "Scrub, then dry."      the underside: both brushes and the drying strip
--                           (was the shared brushes render)
--   "One battery to start." the base with its two battery bays (was the
--                           Youth's battery photo)
--   "Check the reports."    unchanged (the owner's screen photo)
--
-- Photos are on S3 (findmyrobo-media, Aventurier/A1-Basic/) behind CloudFront.
-- Each section photo is set only where its English heading matches, so
-- nothing else edited in Admin is touched. Safe to re-run.
--
-- Run in Supabase: SQL Editor -> New query -> paste -> Run. Nothing to edit.

begin;

update public.products
set page = jsonb_set(page, '{showcase,colors}', '[
  {"image": "https://d5hk9n8my7l32.cloudfront.net/Aventurier/A1-Basic/A1-Basic-grey.webp", "label": {"en": "Grey", "th": "สีเทา"}, "swatch": "#4b5058"},
  {"image": "https://d5hk9n8my7l32.cloudfront.net/Aventurier/A1-Basic/A1-Basic-hero.webp", "label": {"en": "White", "th": "สีขาว"}, "swatch": "#f3f3f3"}
]'::jsonb)
where id = 'aventurier-a1-basic' and page ? 'showcase';

update public.products
set page = jsonb_set(page, '{blocks,1,image}', '"https://d5hk9n8my7l32.cloudfront.net/Aventurier/A1-Basic/A1-Basic-brushes.webp"')
where id = 'aventurier-a1-basic' and page->'blocks'->1->'heading'->>'en' = 'Scrub, then dry.';

update public.products
set page = jsonb_set(page, '{blocks,2,image}', '"https://d5hk9n8my7l32.cloudfront.net/Aventurier/A1-Basic/A1-Basic-battery.webp"')
where id = 'aventurier-a1-basic' and page->'blocks'->2->'heading'->>'en' = 'One battery to start.';

commit;

-- Check afterwards (read-only):
--   select b->'heading'->>'en' as section, b->>'image' as photo
--   from products, jsonb_array_elements(page->'blocks') b where id = 'aventurier-a1-basic';
--
-- Then open A1-Basic in Admin -> Products and click Save (no change needed),
-- so the live page is rebuilt with the photos.
