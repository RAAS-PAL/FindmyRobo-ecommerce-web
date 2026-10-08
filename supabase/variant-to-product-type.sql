-- Migration: `variant` becomes the type of product, not a model name.
--
-- Before: luba, mini, pool, install, demo (luba = LUBA 3, mini = LUBA Mini 2),
-- plus cleaner, delivery, cooking, equipment from add-multi-brand-catalogue.sql.
-- After:  mower, pool, cleaner, equipment, cooking, delivery, installation, demo.
--
-- The old values also picked two things tied to one model, which now live on
-- the product itself:
--   - the card's hover video  -> the product's hover_video
--   - the parts diagram       -> the "Under the hood" section's `model`
-- They are carried over ONLY for the products of the model they describe:
-- LUBA 3 AWD 3000/5000 (LUBA 3 clip and diagram) and LUBA Mini 2 AWD 1500
-- (Mini clip and diagram). YUKA Mini 2 and LUBA Mini 2 AWD 1000 were set to
-- "luba" and so borrowed LUBA 3's; they get neither, until they have their own.
--
-- WHEN: right AFTER the code that knows the new values is live on main. The
-- old code on the live site doesn't know them (it would drop the LUBA parts
-- diagrams). The new code reads both, so the order is: merge, then run this.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Back up first: create table products_backup_<date> as select * from products;

begin;

-- 1. Hover videos, where the product has none of its own.
update public.products
set hover_video = '/videos/hero-banner-luba3.mp4'
where variant = 'luba' and id like 'luba-3-%'
  and coalesce(hover_video, '') = '';

update public.products
set hover_video = '/videos/hero-luba-mini.mp4'
where variant = 'mini' and id = 'luba-mini-awd-1500'
  and coalesce(hover_video, '') = '';

-- 2. Name the model on each "Under the hood" section that has none.
update public.products
set page = jsonb_set(page, '{blocks}', (
  select coalesce(jsonb_agg(
    case when b->>'type' = 'anatomy' and coalesce(b->>'model', '') = ''
         then b || '{"model": "luba-3"}'::jsonb else b end
    order by i), '[]'::jsonb)
  from jsonb_array_elements(page->'blocks') with ordinality as e(b, i)
))
where variant = 'luba' and id like 'luba-3-%'
  and jsonb_typeof(page->'blocks') = 'array';

update public.products
set page = jsonb_set(page, '{blocks}', (
  select coalesce(jsonb_agg(
    case when b->>'type' = 'anatomy' and coalesce(b->>'model', '') = ''
         then b || '{"model": "luba-mini-2"}'::jsonb else b end
    order by i), '[]'::jsonb)
  from jsonb_array_elements(page->'blocks') with ordinality as e(b, i)
))
where variant = 'mini' and id = 'luba-mini-awd-1500'
  and jsonb_typeof(page->'blocks') = 'array';

-- 3. The new values. Drop whichever check on `variant` exists (its name
--    depends on which script created it), convert, then add the new check.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.products'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%variant%'
  loop
    execute format('alter table public.products drop constraint %I', c.conname);
  end loop;
end $$;

update public.products
set variant = case variant
  when 'luba' then 'mower'
  when 'mini' then 'mower'
  when 'install' then 'installation'
  else variant
end
where variant in ('luba', 'mini', 'install');

alter table public.products
  add constraint products_variant_check
  check (variant in (
    'mower', 'pool', 'cleaner', 'equipment', 'cooking', 'delivery',
    'installation', 'demo'
  ));

commit;

-- Check afterwards (read-only):
--   select id, name, variant, hover_video,
--          jsonb_path_query_array(page, '$.blocks[*] ? (@.type == "anatomy")') as diagram
--   from products order by sort_order;
