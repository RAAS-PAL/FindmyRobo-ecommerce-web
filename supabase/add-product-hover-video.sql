-- Per-product hover video: the short clip that plays on the product card when
-- a shopper hovers over it (see components/ui/ProductCard.tsx). Optional — a
-- product without one just shows its image. Stored as a URL or /public path,
-- exactly like image_url.
--
-- Safe to run more than once. lib/productStore.ts degrades gracefully until
-- this is applied (it strips hover_video from writes if the column is absent),
-- so the storefront keeps working during deployment.

alter table products add column if not exists hover_video text;
