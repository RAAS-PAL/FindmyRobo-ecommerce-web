-- RoboStore TH — orders schema (first-time setup)
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (IF NOT EXISTS / OR REPLACE).

-- 1. Orders. `items` is a jsonb snapshot taken at purchase time on purpose: if a
--    product is later renamed, repriced, or deleted, the order must still show
--    what was actually bought for what it actually cost.
--
--    Money is stored in whole Thai Baht, matching products.price. Omise works in
--    satang (baht * 100); that conversion lives in the app, never in the table.
create table if not exists public.orders (
  id         text primary key,                 -- RP-YYYYMMDD-XXXX, shown to the customer
  user_id    uuid references auth.users(id) on delete set null,  -- null = guest checkout
  status     text not null default 'pending_payment'
             check (status in ('pending_payment', 'paid', 'failed', 'expired', 'cancelled', 'refunded')),
  shipping   jsonb not null,                   -- { fullName, email, phone, address, district, province, postalCode, note }
  items      jsonb not null,                   -- [{ id, name, qty, unitPrice, forId?, forName? }]
  subtotal   integer not null check (subtotal >= 0),  -- ฿, server-computed from the products table
  total      integer not null check (total >= 0),     -- ฿, what the customer is charged
  currency   text not null default 'THB',
  payment    jsonb,                            -- { method, chargeId, sourceId, ... } — filled in by the payment phases
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Indexes for the two ways orders get listed.
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);

-- 3. Keep updated_at fresh (reuses the same trigger function as products; the
--    products schema may not have been run yet, so define it here too).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- 4. Row-level security: a signed-in customer may read ONLY their own orders.
--    There is deliberately no insert/update/delete policy — orders are created
--    and settled by the server using the SECRET key (which bypasses RLS), so a
--    browser can never write an order or mark one paid.
--    Guest orders (user_id is null) are unreadable via the public key by design;
--    they are reached server-side by order id.
alter table public.orders enable row level security;

drop policy if exists "own orders read" on public.orders;
create policy "own orders read"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);
