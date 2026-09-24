-- OPTIONAL cleanup, after the move to Payload CMS.
--
-- The site briefly had a hand-built content editor that stored its sections in
-- public.site_content (+ site_content_revisions). Payload replaced it; on its
-- first deploy the Payload seed migration copied anything published there into
-- the CMS (payload/seed.ts). After that these tables are unused.
--
-- Run this only once /cms shows your content. Until then, leave the tables:
-- the seed reads them.
drop table if exists public.site_content_revisions;
drop table if exists public.site_content;

-- The `marketing` value in the profiles role check is also unused now (CMS
-- roles live on Payload's own users). It is harmless to keep; no change here.
