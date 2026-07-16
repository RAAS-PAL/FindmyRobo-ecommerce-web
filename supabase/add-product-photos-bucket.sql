-- Migration: storage bucket for product photos (admin uploads)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Creates the PUBLIC bucket that the admin panel's image uploader writes to.
-- Safe to re-run.
--
-- Public = anyone with the URL can read the photo, which is what we want: these
-- are storefront product images served to every shopper. Uploads are NOT public
-- — they go through /api/admin/upload, which checks the admin session and then
-- writes with the SECRET key (bypasses RLS), so no insert policy is needed here.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do update set public = true;
