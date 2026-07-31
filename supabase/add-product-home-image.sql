-- Separate image for the home-page feature card (a lifestyle photo), distinct
-- from image_url (the product render used on the product page and shop cards).
-- Optional — when unset the home card falls back to image_url. See
-- components/ui/FeaturedProductCard.tsx.
--
-- Safe to run more than once. lib/productStore.ts degrades gracefully until
-- this is applied (it strips home_image from writes if the column is absent).

alter table products add column if not exists home_image text;
