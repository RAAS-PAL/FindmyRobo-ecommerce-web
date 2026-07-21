-- Migration: order fulfilment state (Sokochan 3PL)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Fulfilment is tracked separately from payment: the `status` column stays the
-- payment lifecycle (pending_payment/paid/…), while shipping progress lives in
-- this jsonb, mirroring how `payment` works. Shape:
--   { sokochanOrderCode, carrier, status, trackingNumber, updatedAt, error }
-- where status is one of created|picked|packed|shipped|cancelled.
alter table public.orders
  add column if not exists fulfillment jsonb;
