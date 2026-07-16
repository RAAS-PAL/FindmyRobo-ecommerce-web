-- Add persistent drag-and-drop ordering to an existing products table.
-- Run once in Supabase Dashboard -> SQL Editor.

alter table public.products
  add column if not exists sort_order integer not null default 1000;

create index if not exists products_sort_order_idx
  on public.products (sort_order, created_at, id);

create index if not exists products_category_sort_order_idx
  on public.products (category, sort_order, created_at, id);

create or replace function public.reorder_products(product_ids text[])
returns void
language plpgsql
set search_path = public
as $$
begin
  if cardinality(product_ids) <> (select count(*) from public.products)
     or cardinality(product_ids) <>
       (select count(distinct item.id) from unnest(product_ids) as item(id))
     or exists (
       select 1 from unnest(product_ids) as requested(id)
       where not exists (
         select 1 from public.products p where p.id = requested.id
       )
     ) then
    raise exception 'Product order must contain every product exactly once';
  end if;

  update public.products as p
  set sort_order = ordered.position * 10
  from unnest(product_ids) with ordinality as ordered(id, position)
  where p.id = ordered.id;
end;
$$;
