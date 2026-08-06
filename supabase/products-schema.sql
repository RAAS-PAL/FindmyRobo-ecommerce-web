-- RoboMart TH — products schema (first-time setup)
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (IF NOT EXISTS / OR REPLACE / on conflict) if you need to.

-- 1. Products table. The nested/bilingual fields (specs, tagline, description,
--    features) are stored as jsonb because they map 1:1 to the app's Product
--    object and are only ever read as whole blobs, never queried field-by-field.
create table if not exists public.products (
  id          text primary key,                    -- slug, also the storefront URL
  sort_order  integer not null default 1000,       -- admin-controlled storefront position
  name        text not null,
  price       integer not null check (price > 0),  -- whole Thai Baht (฿), no satang
  category    text not null,                        -- validated in-app vs data/categories.ts
  variant     text not null check (variant in ('luba', 'mini', 'pool', 'install', 'demo')),
  image_url   text,                                  -- optional main product photo; variant art is the fallback
  images      jsonb not null default '[]'::jsonb,   -- extra gallery photos (URLs) shown after image_url
  preorder    boolean not null default false,
  visible     boolean not null default true,        -- false = hidden from the storefront (kept in the DB)
  specs       jsonb not null default '{}'::jsonb,   -- { area, slope, ... }
  tagline     jsonb not null,                       -- { en, th }
  description jsonb not null,                        -- { en, th }
  features    jsonb not null,                        -- { en: [...], th: [...] }
  page        jsonb,                                 -- rich detail page: { videoUrl, blocks[], specGroups[] }
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Existing databases created before these columns were introduced also receive them.
alter table public.products
  add column if not exists sort_order integer not null default 1000;
alter table public.products
  add column if not exists visible boolean not null default true;

-- 2. Index the column we filter on (category pages call WHERE category = ...).
create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_order_idx
  on public.products (sort_order, created_at, id);
create index if not exists products_category_sort_order_idx
  on public.products (category, sort_order, created_at, id);

-- 3. Keep updated_at fresh on every edit.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- Replace the complete order atomically. The admin API calls this with every
-- current product id, so duplicate/missing ids are rejected before any update.
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
       where not exists (select 1 from public.products p where p.id = requested.id)
     ) then
    raise exception 'Product order must contain every product exactly once';
  end if;

  update public.products as p
  set sort_order = ordered.position * 10
  from unnest(product_ids) with ordinality as ordered(id, position)
  where p.id = ordered.id;
end;
$$;

-- 4. Row-level security: the catalog is PUBLIC to read (anon shoppers included),
--    but writes only happen through the SECRET key from the admin API, which
--    bypasses RLS — so there is deliberately no insert/update/delete policy.
alter table public.products enable row level security;

drop policy if exists "public catalog read" on public.products;
create policy "public catalog read"
  on public.products for select
  using (true);

-- 5. Seed the current catalog (6 robots + 4 service packages). "on conflict
--    (id) do nothing" makes this re-runnable without duplicating rows.
insert into public.products
  (id, name, price, category, variant, preorder, specs, tagline, description, features)
values
  ('luba-3-awd-5000', 'MAMMOTION LUBA 3 AWD 5000', 185000, 'robot-mowers', 'luba', true, '{"area":"5,000 m²","slope":"80% (38°)","cuttingWidth":"400 mm","runtime":"180 min","connectivity":"RTK + Vision, 4G, Wi-Fi"}'::jsonb, '{"en":"Flagship AWD mower for estates up to 5,000 m²","th":"รุ่นเรือธงขับเคลื่อน 4 ล้อ สำหรับพื้นที่สูงสุด 5,000 ตร.ม."}'::jsonb, '{"en":"The flagship of the LUBA family. All-wheel drive, RTK + Vision navigation, and enough capacity for estate-sized lawns — it mows while you live.","th":"เรือธงของตระกูล LUBA ขับเคลื่อน 4 ล้อ นำทางด้วย RTK + Vision รองรับสนามหญ้าขนาดใหญ่ระดับคฤหาสน์ — ให้หุ่นยนต์ตัดหญ้า ส่วนคุณใช้ชีวิต"}'::jsonb, '{"en":["AWD climbs slopes up to 80% without slipping","RTK + Vision: centimeter-accurate mowing, no boundary wire","App-drawn zones, schedules, and no-go areas","Anti-theft GPS tracking and 4G alerts"],"th":["ขับเคลื่อน 4 ล้อ ปีนทางลาดชันได้ถึง 80% ไม่มีลื่นไถล","RTK + Vision แม่นยำระดับเซนติเมตร ไม่ต้องเดินสายขอบเขต","วาดโซน ตั้งเวลา และกำหนดพื้นที่ห้ามเข้าผ่านแอป","ระบบกันขโมย GPS พร้อมแจ้งเตือนผ่าน 4G"]}'::jsonb),
  ('luba-3-awd-3000', 'MAMMOTION LUBA 3 AWD 3000', 159000, 'robot-mowers', 'luba', false, '{"area":"3,000 m²","slope":"80% (38°)","cuttingWidth":"400 mm","runtime":"180 min","connectivity":"RTK + Vision, 4G, Wi-Fi"}'::jsonb, '{"en":"All-wheel drive precision for large Thai gardens","th":"ความแม่นยำระดับสูงสำหรับสวนขนาดใหญ่"}'::jsonb, '{"en":"All the flagship technology, sized for large family gardens. Perfect stripes, no boundary wires, no effort.","th":"เทคโนโลยีระดับเรือธงครบครัน ในขนาดที่เหมาะกับสวนครอบครัวขนาดใหญ่ ลายสวยเป๊ะ ไม่ต้องเดินสาย ไม่ต้องออกแรง"}'::jsonb, '{"en":["AWD climbs slopes up to 80% without slipping","RTK + Vision: centimeter-accurate mowing, no boundary wire","Multi-zone management for front and back gardens","Rain sensor returns it to the dock automatically"],"th":["ขับเคลื่อน 4 ล้อ ปีนทางลาดชันได้ถึง 80% ไม่มีลื่นไถล","RTK + Vision แม่นยำระดับเซนติเมตร ไม่ต้องเดินสายขอบเขต","จัดการหลายโซน ทั้งสวนหน้าบ้านและหลังบ้าน","เซ็นเซอร์ฝนพากลับแท่นชาร์จอัตโนมัติ"]}'::jsonb),
  ('luba-3-awd-1500', 'MAMMOTION LUBA 3 AWD 1500', 125000, 'robot-mowers', 'luba', true, '{"area":"1,500 m²","slope":"80% (38°)","cuttingWidth":"400 mm","runtime":"160 min","connectivity":"RTK + Vision, Wi-Fi"}'::jsonb, '{"en":"Slope-conquering power for mid-size lawns","th":"พลังพิชิตทางลาดชันสำหรับสนามขนาดกลาง"}'::jsonb, '{"en":"Serious slope-climbing power for mid-size lawns with tricky terrain, tight passages, and steep banks.","th":"พลังปีนทางลาดชันตัวจริง สำหรับสนามขนาดกลางที่มีภูมิประเทศซับซ้อน ทางแคบ และเนินสูงชัน"}'::jsonb, '{"en":["Full-size cutting deck in a mid-size package","Handles steep banks and uneven Thai terrain","App-drawn zones, schedules, and no-go areas","Quiet enough to run at night"],"th":["ใบตัดขนาดเต็มในตัวถังขนาดกลาง","รับมือเนินชันและพื้นที่ขรุขระแบบไทยๆ ได้สบาย","วาดโซน ตั้งเวลา และกำหนดพื้นที่ห้ามเข้าผ่านแอป","เงียบพอที่จะทำงานตอนกลางคืน"]}'::jsonb),
  ('luba-mini-2-awd-1500', 'LUBA Mini 2 AWD 1500', 99000, 'robot-mowers', 'mini', false, '{"area":"1,500 m²","slope":"80% (38°)","cuttingWidth":"210 mm","runtime":"150 min","connectivity":"RTK + Vision, Wi-Fi"}'::jsonb, '{"en":"Compact AWD agility for tighter spaces","th":"ตัวเล็กคล่องตัว ขับเคลื่อน 4 ล้อ สำหรับพื้นที่แคบ"}'::jsonb, '{"en":"The compact AWD mower that handles narrow gates and dense landscaping without giving up climbing ability.","th":"หุ่นยนต์ตัดหญ้า AWD ตัวกะทัดรัด ลอดประตูแคบและสวนที่จัดแน่นได้ โดยไม่เสียความสามารถในการปีนเนิน"}'::jsonb, '{"en":["Fits through gates as narrow as 60 cm","AWD grip on slopes up to 80%","Vision avoids toys, pets, and garden furniture","No boundary wire — set up from your phone"],"th":["ลอดประตูแคบได้ถึง 60 ซม.","เกาะถนนแบบ AWD บนทางลาดชันถึง 80%","Vision หลบของเล่น สัตว์เลี้ยง และเฟอร์นิเจอร์สวน","ไม่ต้องเดินสายขอบเขต — ตั้งค่าผ่านมือถือ"]}'::jsonb),
  ('luba-mini-awd-800', 'LUBA Mini AWD 800', 79000, 'robot-mowers', 'mini', false, '{"area":"800 m²","slope":"65% (33°)","cuttingWidth":"210 mm","runtime":"120 min","connectivity":"RTK + Vision, Wi-Fi"}'::jsonb, '{"en":"The effortless choice for city gardens","th":"ตัวเลือกง่ายๆ สำหรับสวนในเมือง"}'::jsonb, '{"en":"Everything a city garden needs: quiet, precise, wire-free mowing that fits smaller spaces and budgets.","th":"ทุกอย่างที่สวนในเมืองต้องการ: เงียบ แม่นยำ ไร้สายขอบเขต ในขนาดและราคาที่เข้าถึงง่าย"}'::jsonb, '{"en":["Compact body for city gardens and courtyards","Wire-free setup in under 30 minutes","Vision avoids toys, pets, and garden furniture","Whisper-quiet operation"],"th":["ตัวถังกะทัดรัดสำหรับสวนในเมืองและคอร์ทยาร์ด","ติดตั้งแบบไร้สายเสร็จในไม่ถึง 30 นาที","Vision หลบของเล่น สัตว์เลี้ยง และเฟอร์นิเจอร์สวน","ทำงานเงียบกริบ"]}'::jsonb),
  ('spino-e1-pool', 'Spino E1 Pool Cleaner', 45000, 'pool-cleaners', 'pool', false, '{"area":"80 m² pool","runtime":"150 min","filtration":"180 µm","connectivity":"App control, Bluetooth"}'::jsonb, '{"en":"Crystal-clear pools without lifting a finger","th":"สระใสสะอาดโดยไม่ต้องยกนิ้วสักนิด"}'::jsonb, '{"en":"Drop it in and forget it. The Spino E1 scrubs floor, walls, and waterline, then parks itself at the edge for easy retrieval.","th":"หย่อนลงสระแล้วปล่อยให้ทำงาน Spino E1 ขัดพื้น ผนัง และแนวขอบน้ำ เสร็จแล้วจอดรอที่ขอบสระให้หยิบขึ้นง่ายๆ"}'::jsonb, '{"en":["Cleans floor, walls, and waterline","Cordless — no tangles, no hoses","Self-parks at the pool edge when finished","Fine 180 µm filtration for crystal-clear water"],"th":["ทำความสะอาดพื้น ผนัง และแนวขอบน้ำ","ไร้สาย — ไม่มีสายพันกัน ไม่มีท่อ","จอดเองที่ขอบสระเมื่อทำงานเสร็จ","ระบบกรองละเอียด 180 µm เพื่อน้ำใสระดับคริสตัล"]}'::jsonb),
  ('install-up-to-1000', 'Installation Service — Up to 1,000 m²', 3500, 'services', 'install', false, '{"area":"Up to 1,000 m²"}'::jsonb, '{"en":"Professional on-site setup for gardens up to 1,000 m² (~2.5 hrs)","th":"บริการติดตั้งถึงบ้านสำหรับสวนไม่เกิน 1,000 ตร.ม. (~2.5 ชม.)"}'::jsonb, '{"en":"Our technicians install and calibrate your robot on site — mapping boundaries, setting no-go zones, and running a full test cycle. Sized for gardens up to 1,000 m² (about 2.5 hours).","th":"ทีมช่างของเราติดตั้งและปรับตั้งค่าหุ่นยนต์ให้ถึงบ้าน ทั้งกำหนดขอบเขต ตั้งพื้นที่ห้ามเข้า และทดสอบการทำงานเต็มรูปแบบ เหมาะสำหรับสวนไม่เกิน 1,000 ตร.ม. (ประมาณ 2.5 ชม.)"}'::jsonb, '{"en":["On-site boundary mapping and calibration","No-go zone and schedule setup","Full test run before handover","Covers gardens up to 1,000 m² (~2.5 hrs)"],"th":["กำหนดขอบเขตและปรับตั้งค่าถึงบ้าน","ตั้งค่าพื้นที่ห้ามเข้าและตารางการทำงาน","ทดสอบการทำงานเต็มรูปแบบก่อนส่งมอบ","รองรับสวนไม่เกิน 1,000 ตร.ม. (~2.5 ชม.)"]}'::jsonb),
  ('install-up-to-2000', 'Installation Service — Up to 2,000 m²', 5500, 'services', 'install', false, '{"area":"Up to 2,000 m²"}'::jsonb, '{"en":"Professional on-site setup for gardens up to 2,000 m² (~3.5 hrs)","th":"บริการติดตั้งถึงบ้านสำหรับสวนไม่เกิน 2,000 ตร.ม. (~3.5 ชม.)"}'::jsonb, '{"en":"Full on-site installation for mid-size gardens — boundary mapping, no-go zones, multi-zone scheduling, and a complete test run. Sized for gardens up to 2,000 m² (about 3.5 hours).","th":"บริการติดตั้งถึงบ้านแบบครบวงจรสำหรับสวนขนาดกลาง ทั้งกำหนดขอบเขต พื้นที่ห้ามเข้า ตั้งตารางหลายโซน และทดสอบการทำงานเต็มรูปแบบ เหมาะสำหรับสวนไม่เกิน 2,000 ตร.ม. (ประมาณ 3.5 ชม.)"}'::jsonb, '{"en":["On-site boundary mapping and calibration","Multi-zone schedule and no-go setup","Full test run before handover","Covers gardens up to 2,000 m² (~3.5 hrs)"],"th":["กำหนดขอบเขตและปรับตั้งค่าถึงบ้าน","ตั้งค่าหลายโซนและพื้นที่ห้ามเข้า","ทดสอบการทำงานเต็มรูปแบบก่อนส่งมอบ","รองรับสวนไม่เกิน 2,000 ตร.ม. (~3.5 ชม.)"]}'::jsonb),
  ('install-up-to-10000', 'Installation Service — Up to 10,000 m²', 12000, 'services', 'install', false, '{"area":"Up to 10,000 m²"}'::jsonb, '{"en":"Professional on-site setup for large estates up to 10,000 m² (~8 hrs)","th":"บริการติดตั้งถึงบ้านสำหรับพื้นที่ขนาดใหญ่ไม่เกิน 10,000 ตร.ม. (~8 ชม.)"}'::jsonb, '{"en":"Comprehensive installation for estate-sized grounds — precise boundary mapping, complex multi-zone scheduling, obstacle handling, and a full commissioning test. Sized for areas up to 10,000 m² (about 8 hours).","th":"บริการติดตั้งแบบครบวงจรสำหรับพื้นที่ขนาดใหญ่ระดับคฤหาสน์ ทั้งกำหนดขอบเขตอย่างแม่นยำ ตั้งตารางหลายโซนที่ซับซ้อน จัดการสิ่งกีดขวาง และทดสอบการใช้งานเต็มรูปแบบ เหมาะสำหรับพื้นที่ไม่เกิน 10,000 ตร.ม. (ประมาณ 8 ชม.)"}'::jsonb, '{"en":["Precise boundary mapping for large grounds","Complex multi-zone scheduling and no-go areas","Obstacle and terrain handling","Full commissioning test (~8 hrs)"],"th":["กำหนดขอบเขตอย่างแม่นยำสำหรับพื้นที่ขนาดใหญ่","ตั้งตารางหลายโซนที่ซับซ้อนและพื้นที่ห้ามเข้า","จัดการสิ่งกีดขวางและสภาพพื้นที่","ทดสอบการใช้งานเต็มรูปแบบ (~8 ชม.)"]}'::jsonb),
  ('request-a-demo', 'Request a Demo', 990, 'services', 'demo', false, '{}'::jsonb, '{"en":"A hands-on demo of your chosen robot, at your home","th":"สาธิตการใช้งานหุ่นยนต์ที่คุณสนใจ ถึงบ้านคุณ"}'::jsonb, '{"en":"A specialist brings the robot to your property and runs a live demonstration on your own lawn or pool, answering questions and showing setup. The fee is credited toward your purchase.","th":"ผู้เชี่ยวชาญนำหุ่นยนต์ไปสาธิตการใช้งานจริงที่สนามหญ้าหรือสระของคุณ พร้อมตอบทุกคำถามและสาธิตการติดตั้ง ค่าบริการนี้นำไปเป็นส่วนลดเมื่อซื้อสินค้าได้"}'::jsonb, '{"en":["Live, on-site demonstration","See it work on your own lawn or pool","Ask a specialist anything","Fee credited toward your purchase"],"th":["สาธิตการใช้งานจริงถึงบ้าน","ดูการทำงานบนสนามหรือสระของคุณเอง","ปรึกษาผู้เชี่ยวชาญได้ทุกเรื่อง","ค่าบริการใช้เป็นส่วนลดตอนซื้อได้"]}'::jsonb)
on conflict (id) do nothing;
