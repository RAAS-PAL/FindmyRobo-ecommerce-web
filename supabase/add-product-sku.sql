-- Migration: product warehouse SKU (for Sokochan fulfilment)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- The SKU is the code Sokochan's warehouse uses to identify the physical
-- product on its shelves. It is sent as order_items[].item_sku when an order is
-- pushed to Sokochan, so it must match the code registered there. Nullable —
-- services (installation, demos) are never shipped and carry no SKU.
alter table public.products
  add column if not exists sku text;
