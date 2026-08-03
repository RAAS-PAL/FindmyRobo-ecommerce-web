-- Customer product reviews.
-- Public read; each signed-in customer may leave ONE review per product (they
-- can edit it). "verified" is set true when the reviewer has an order for that
-- product. Run once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  title       text not null,
  body        text not null,
  verified    boolean not null default false,  -- reviewer has an order for this product
  visible     boolean not null default true,   -- staff can hide abusive reviews
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

-- keep updated_at fresh on edits
create or replace function public.reviews_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.reviews_touch_updated_at();

-- Row Level Security. Reads/writes from the app go through the service-role
-- client (bypasses RLS) with auth enforced in the API route; these policies are
-- defense-in-depth for any direct anon/authenticated access.
alter table public.reviews enable row level security;

drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews
  for select using (visible = true);

drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own" on public.reviews
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "reviews update own" on public.reviews;
create policy "reviews update own" on public.reviews
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews delete own" on public.reviews;
create policy "reviews delete own" on public.reviews
  for delete to authenticated using (auth.uid() = user_id);
