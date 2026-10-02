-- Seed: put the robots that were only in code into the products table.
--
-- Adds Gausium Phantas, Aventurier A1-Basic and A1-Youth, T-Chef TC-E10A and
-- Pudu1, Pudu2, Bella and Ketty, so they can be edited in Admin -> Products.
-- Text, specs and feature sections are copied from the hand-written pages
-- (data/modelPages.ts) and from data/lineup.ts; A1-Basic and the Pudu robots
-- get only a short line until their spec sheets arrive. The Thai text is a
-- DRAFT for the Thai team.
--
-- Every row goes in HIDDEN (visible = false). The live site and the preview
-- share this database, so nothing changes on findmyrobo.com until the rows
-- are switched on (step at the bottom), after the code that shows them is live.
--
-- Before running:
--   1. Run add-multi-brand-catalogue.sql (brand, conditions, variants) and
--      allow-unknown-price.sql (lets a price be empty).
--   2. Prices below are in whole baht. Leave null where the price isn't known
--      yet: the site shows "Price on request" and keeps it out of the cart.
--
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to
-- re-run: a robot whose id is already in the table is skipped, never
-- overwritten.

begin;

with prices (id, price) as (
  values
    ('gausium-phantas',     null::integer),
    ('aventurier-a1-basic', null::integer),
    ('aventurier-a1-youth', null::integer),
    ('t-chef-tc-e10a',      null::integer),
    ('pudu-1',              null::integer),
    ('pudu-2',              null::integer),
    ('pudu-bella',          null::integer),
    ('pudu-ketty',          null::integer)
),
robots (id, sort_order, name, brand, category, variant, conditions, image_url,
        tagline, description, features, page) as (
  values
  -- Gausium Phantas
  ('gausium-phantas', 1100, 'Phantas', 'Gausium', 'cleaning-robots', 'cleaner',
   array['new', 'pre-owned'], '/models/gausium-phantas.webp',
   '{"en":"Sweeping, scrubbing, vacuuming and mopping in one autonomous robot.","th":"กวาด ขัด ดูด และถูพื้น ครบในหุ่นยนต์อัตโนมัติตัวเดียว"}'::jsonb,
   '{"en":"Gausium Phantas is an autonomous commercial cleaning robot that sweeps, scrubs, vacuums and mops. Available brand-new or pre-owned.","th":"Gausium Phantas หุ่นยนต์ทำความสะอาดเชิงพาณิชย์อัตโนมัติ กวาด ขัด ดูด และถูพื้น มีทั้งเครื่องใหม่และเครื่องที่ผ่านการใช้งาน"}'::jsonb,
   '{"en":["Max. cleaning efficiency: 400–700 m²/h","Runtime: 2–4 h","Charging time: 2 h","Smallest obstacle detected: 10 mm"],"th":["ประสิทธิภาพการทำความสะอาดสูงสุด: 400–700 m²/h","ระยะเวลาทำงาน: 2–4 h","ระยะเวลาชาร์จ: 2 h","ตรวจจับสิ่งกีดขวางสูงตั้งแต่: 10 mm"]}'::jsonb,
   '{"blocks":[{"type":"feature","heading":{"en":"One robot, four jobs.","th":"หุ่นยนต์ตัวเดียว ทำได้ 4 งาน"},"body":{"en":"Phantas sweeps, scrubs, vacuums and mops, with a roller brush and a side brush. It cleans a 410 mm path when sweeping and 330 mm when scrubbing.","th":"Phantas กวาด ขัด ดูด และถูพื้นได้ ด้วยแปรงลูกกลิ้งและแปรงข้าง ความกว้างการทำความสะอาด 410 มม. เมื่อกวาด และ 330 มม. เมื่อขัดพื้น"},"image":"/models/phantas/office.webp"},{"type":"feature","heading":{"en":"Sees what''s in its way.","th":"มองเห็นทุกสิ่งที่ขวางทาง"},"body":{"en":"One 2D LiDAR and three 3D cameras map its surroundings, with an electronic bumper as backup. It detects obstacles from 10 mm high and moves at up to 0.8 m/s.","th":"LiDAR 2 มิติ 1 ตัว และกล้อง 3 มิติ 3 ตัว ช่วยรับรู้สภาพแวดล้อม พร้อมกันชนอิเล็กทรอนิกส์ ตรวจจับสิ่งกีดขวางสูงตั้งแต่ 10 มม. และเคลื่อนที่ได้เร็วสูงสุด 0.8 ม./วินาที"},"image":"/models/phantas/lift.webp"},{"type":"feature","heading":{"en":"Hours of cleaning per charge.","th":"ทำความสะอาดได้นานต่อการชาร์จหนึ่งครั้ง"},"body":{"en":"A 40 Ah lithium battery runs for 2 to 4 hours and recharges in 2 hours at its charging dock.","th":"แบตเตอรี่ลิเธียม 40 Ah ทำงานได้ 2–4 ชั่วโมง และชาร์จเต็มใน 2 ชั่วโมงที่แท่นชาร์จ"},"image":"/models/phantas/dock.webp"}],"specGroups":[{"title":{"en":"Cleaning","th":"การทำความสะอาด"},"rows":[{"label":{"en":"Functions","th":"ฟังก์ชัน"},"value":{"en":"Sweeping, scrubbing, vacuuming, mopping","th":"กวาด ขัด ดูด ถู"}},{"label":{"en":"Cleaning width","th":"ความกว้างการทำความสะอาด"},"value":{"en":"410 mm (sweeping) / 330 mm (scrubbing)","th":"410 มม. (กวาด) / 330 มม. (ขัด)"}},{"label":{"en":"Brushes","th":"แปรง"},"value":{"en":"Roller brush, side brush","th":"แปรงลูกกลิ้ง แปรงข้าง"}},{"label":{"en":"Max. efficiency","th":"ประสิทธิภาพสูงสุด"},"value":{"en":"400–700 m²/h","th":"400–700 m²/h"}}]},{"title":{"en":"Navigation","th":"ระบบนำทาง"},"rows":[{"label":{"en":"Sensors","th":"เซนเซอร์"},"value":{"en":"2D LiDAR ×1, 3D camera ×3, electronic bumper ×1","th":"LiDAR 2 มิติ ×1, กล้อง 3 มิติ ×3, กันชนอิเล็กทรอนิกส์ ×1"}},{"label":{"en":"Min. obstacle height detected","th":"ความสูงสิ่งกีดขวางต่ำสุดที่ตรวจจับได้"},"value":{"en":"10 mm","th":"10 มม."}},{"label":{"en":"Max. moving speed","th":"ความเร็วสูงสุด"},"value":{"en":"0.8 m/s","th":"0.8 ม./วินาที"}}]},{"title":{"en":"Power","th":"พลังงาน"},"rows":[{"label":{"en":"Battery","th":"แบตเตอรี่"},"value":{"en":"40 Ah lithium","th":"ลิเธียม 40 Ah"}},{"label":{"en":"Runtime","th":"ระยะเวลาทำงาน"},"value":{"en":"2–4 h","th":"2–4 ชั่วโมง"}},{"label":{"en":"Charging time","th":"ระยะเวลาชาร์จ"},"value":{"en":"2 h","th":"2 ชั่วโมง"}},{"label":{"en":"Charging dock","th":"แท่นชาร์จ"},"value":{"en":"Yes","th":"มี"}}]},{"title":{"en":"Size and weight","th":"ขนาดและน้ำหนัก"},"rows":[{"label":{"en":"Dimensions (L × W × H)","th":"ขนาด (ย × ก × ส)"},"value":{"en":"540 × 440 × 617 mm","th":"540 × 440 × 617 มม."}},{"label":{"en":"Weight","th":"น้ำหนัก"},"value":{"en":"48 kg","th":"48 กก."}}]}]}'::jsonb),
  -- Aventurier A1-Basic
  ('aventurier-a1-basic', 1110, 'A1-Basic', 'Aventurier', 'smart-equipment', 'equipment',
   array['new'], null,
   '{"en":"A walk-behind floor scrubber with one operating mode.","th":"เครื่องขัดพื้นแบบเดินตาม มีโหมดการทำงาน 1 โหมด"}'::jsonb,
   '{"en":"The Aventurier A1-Basic walk-behind floor scrubber. Ask us for the full specs and a quote.","th":"เครื่องขัดพื้นแบบเดินตาม Aventurier A1-Basic สอบถามสเปกและขอใบเสนอราคาได้จากเรา"}'::jsonb,
   '{"en":[],"th":[]}'::jsonb,
   null),
  -- Aventurier A1-Youth
  ('aventurier-a1-youth', 1120, 'A1-Youth', 'Aventurier', 'smart-equipment', 'equipment',
   array['new'], '/models/aventurier/youth/hero.webp',
   '{"en":"A walk-behind floor scrubber with Wi-Fi and 4G, so cleaning reports can be checked. Three operating modes.","th":"เครื่องขัดพื้นแบบเดินตาม เชื่อมต่อ Wi-Fi และ 4G เพื่อตรวจรายงานการทำความสะอาด มีโหมดการทำงาน 3 โหมด"}'::jsonb,
   '{"en":"The Aventurier A1-Youth is a walk-behind floor scrubber with Wi-Fi and 4G, so cleaning reports can be checked, and three operating modes.","th":"Aventurier A1-Youth เครื่องขัดพื้นแบบเดินตาม เชื่อมต่อ Wi-Fi และ 4G เพื่อตรวจรายงานการทำความสะอาด และมีโหมดการทำงาน 3 โหมด"}'::jsonb,
   '{"en":["Cleaning rate: 800–1,200 m²/h","Operating modes: 3","Runtime, one battery: 75 min","Connectivity: Wi-Fi & 4G"],"th":["อัตราการทำความสะอาด: 800–1,200 m²/h","โหมดการทำงาน: 3","ระยะเวลาทำงาน แบตเตอรี่ 1 ก้อน: 75 min","การเชื่อมต่อ: Wi-Fi & 4G"]}'::jsonb,
   '{"blocks":[{"type":"feature","heading":{"en":"Check the reports.","th":"ตรวจรายงานได้"},"body":{"en":"Youth connects over Wi-Fi and 4G, so cleaning reports can be checked. The handle screen shows Full, Lack, Blocking and the battery level.","th":"รุ่น Youth เชื่อมต่อผ่าน Wi-Fi และ 4G จึงตรวจรายงานการทำความสะอาดได้ หน้าจอบนด้ามจับแสดงสถานะถังเต็ม น้ำไม่พอ สิ่งกีดขวาง และระดับแบตเตอรี่"},"image":"/models/aventurier/youth/handle.webp"},{"type":"feature","heading":{"en":"Scrub, then dry.","th":"ขัด แล้วพื้นแห้งทันที"},"body":{"en":"Two disc brushes scrub the floor. The Artist 1 brochure rates suction at 8,000 Pa, brush pressure at 15 kg and brush speed at 350 RPM, and says the floor is dry straight after cleaning.","th":"แปรงจาน 2 หัวขัดพื้น เอกสาร Artist 1 ระบุแรงดูด 8,000 Pa แรงกดแปรง 15 กก. ความเร็วแปรง 350 รอบต่อนาที และพื้นแห้งทันทีหลังทำความสะอาด"},"image":"/models/aventurier/brushes.webp"},{"type":"feature","heading":{"en":"One battery to start.","th":"เริ่มต้นด้วยแบตเตอรี่ 1 ก้อน"},"body":{"en":"One battery is included. The base has a second bay, and extra batteries are sold separately. On the included battery the brochure lists 75 minutes in ECO mode.","th":"ให้แบตเตอรี่มา 1 ก้อน ฐานเครื่องมีช่องสำหรับก้อนที่สอง และมีแบตเตอรี่ขายแยก เอกสารระบุระยะเวลาทำงาน 75 นาทีในโหมด ECO เมื่อใช้แบตเตอรี่ก้อนเดียว"},"image":"/models/aventurier/youth/batteries.webp"}],"specGroups":[{"title":{"en":"Cleaning","th":"การทำความสะอาด"},"rows":[{"label":{"en":"Cleaning rate","th":"อัตราการทำความสะอาด"},"value":{"en":"800–1,200 m²/h","th":"800–1,200 m²/h"}},{"label":{"en":"Working width","th":"ความกว้างในการทำงาน"},"value":{"en":"40 cm","th":"40 ซม."}},{"label":{"en":"Suction","th":"แรงดูด"},"value":{"en":"8,000 Pa","th":"8,000 Pa"}},{"label":{"en":"Brush pressure","th":"แรงกดแปรง"},"value":{"en":"15 kg","th":"15 กก."}},{"label":{"en":"Brush speed","th":"ความเร็วแปรง"},"value":{"en":"350 RPM","th":"350 รอบต่อนาที"}},{"label":{"en":"Noise","th":"เสียง"},"value":{"en":"60 dB(A)","th":"60 dB(A)"}},{"label":{"en":"Operating modes","th":"โหมดการทำงาน"},"value":{"en":"3","th":"3 โหมด"}},{"label":{"en":"Floors","th":"พื้นผิวที่ใช้ได้"},"value":{"en":"Tile, granite, marble, PVC, epoxy, cement","th":"กระเบื้อง หินแกรนิต หินอ่อน พีวีซี อีพ็อกซี ปูน"}}]},{"title":{"en":"Water","th":"น้ำ"},"rows":[{"label":{"en":"Solution tank","th":"ถังน้ำยา"},"value":{"en":"4 L","th":"4 ลิตร"}},{"label":{"en":"Recovery tank","th":"ถังน้ำเสีย"},"value":{"en":"4 L","th":"4 ลิตร"}}]},{"title":{"en":"Battery","th":"แบตเตอรี่"},"rows":[{"label":{"en":"Included","th":"ที่ให้มา"},"value":{"en":"1 battery. Extra batteries sold separately","th":"1 ก้อน แบตเตอรี่เพิ่มมีขายแยก"}},{"label":{"en":"Runtime","th":"ระยะเวลาทำงาน"},"value":{"en":"75 min, one battery, ECO mode","th":"75 นาที แบตเตอรี่ 1 ก้อน โหมด ECO"}}]},{"title":{"en":"Connectivity","th":"การเชื่อมต่อ"},"rows":[{"label":{"en":"Connection","th":"การเชื่อมต่อ"},"value":{"en":"Wi-Fi & 4G","th":"Wi-Fi & 4G"}},{"label":{"en":"Reports","th":"รายงาน"},"value":{"en":"Can be checked","th":"ตรวจสอบได้"}},{"label":{"en":"Handle screen","th":"หน้าจอบนด้ามจับ"},"value":{"en":"Full, Lack, Blocking, battery level","th":"ถังเต็ม น้ำไม่พอ สิ่งกีดขวาง ระดับแบตเตอรี่"}}]},{"title":{"en":"Size and weight","th":"ขนาดและน้ำหนัก"},"rows":[{"label":{"en":"Dimensions","th":"ขนาด"},"value":{"en":"1,104 × 439 × 346 mm","th":"1,104 × 439 × 346 มม."}},{"label":{"en":"Weight","th":"น้ำหนัก"},"value":{"en":"22 kg","th":"22 กก."}}]}]}'::jsonb),
  -- T-Chef TC-E10A
  ('t-chef-tc-e10a', 1130, 'TC-E10A', 'T-Chef', 'cooking-robots', 'cooking',
   array['new', 'pre-owned'], '/models/t-chef-tc-e10a.webp',
   '{"en":"A small intelligent cooking robot with automatic food delivery, 11 stir-fry modes and smart temperature control.","th":"หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก พร้อมระบบเติมวัตถุดิบอัตโนมัติ โหมดผัด 11 แบบ และระบบควบคุมอุณหภูมิอัจฉริยะ"}'::jsonb,
   '{"en":"The T-Chef TC-E10A is a small intelligent cooking robot with automatic food delivery, 11 combination stir-fry modes and smart temperature control. Available brand-new or pre-owned.","th":"T-Chef TC-E10A หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก พร้อมระบบเติมวัตถุดิบอัตโนมัติ โหมดผัดแบบผสมผสาน 11 แบบ และระบบควบคุมอุณหภูมิอัจฉริยะ มีทั้งเครื่องใหม่และเครื่องที่ผ่านการใช้งาน"}'::jsonb,
   '{"en":["Max. cooking capacity: 1 kg","Combination stir-fry modes: 11","Power: 5 kW / 8 kW","Touch LCD colour screen: 7-inch"],"th":["ปริมาณการปรุงสูงสุด: 1 kg","โหมดผัดแบบผสมผสาน: 11","กำลังไฟ: 5 kW / 8 kW","หน้าจอสัมผัส LCD สี: 7-inch"]}'::jsonb,
   '{"blocks":[{"type":"feature","heading":{"en":"Ingredients in, hands free.","th":"เติมวัตถุดิบเอง ไม่ต้องใช้มือ"},"body":{"en":"Its auto food delivery module adds the ingredients for you, leaving your hands free. It seasons with two types of liquid, oil and water.","th":"โมดูลเติมวัตถุดิบอัตโนมัติจะเติมวัตถุดิบให้ คุณจึงไม่ต้องใช้มือ และปรุงรสด้วยของเหลว 2 ชนิด คือ น้ำมันและน้ำ"},"image":"/models/t-chef/feeder.webp"},{"type":"feature","heading":{"en":"11 ways to stir-fry.","th":"ผัดได้ 11 รูปแบบ"},"body":{"en":"11 combination stir-fry modes suit a range of dishes, with smart temperature control and electromagnetic heating. It cooks up to 1 kg, in manual or auto mode.","th":"โหมดผัดแบบผสมผสาน 11 แบบ เหมาะกับอาหารหลากหลายเมนู พร้อมระบบควบคุมอุณหภูมิอัจฉริยะและให้ความร้อนแบบแม่เหล็กไฟฟ้า ปรุงได้สูงสุด 1 กก. ทั้งแบบควบคุมเองและอัตโนมัติ"},"image":"/models/t-chef/wok.webp"},{"type":"feature","heading":{"en":"One-click cooking.","th":"ทำอาหารได้ในคลิกเดียว"},"body":{"en":"A 7-inch touch LCD colour screen gives you one-click cooking. At W599 × D650 × H470 mm and 35 kg, its small size suits a variety of settings.","th":"หน้าจอสัมผัส LCD สีขนาด 7 นิ้ว สั่งทำอาหารได้ในคลิกเดียว ด้วยขนาด กว้าง 599 × ลึก 650 × สูง 470 มม. และน้ำหนัก 35 กก. ตัวเครื่องขนาดเล็กจึงเหมาะกับการใช้งานหลากหลายสถานที่"},"image":"/models/t-chef/controls.webp"}],"specGroups":[{"title":{"en":"Cooking","th":"การปรุงอาหาร"},"rows":[{"label":{"en":"Max. cooking capacity","th":"ปริมาณการปรุงสูงสุด"},"value":{"en":"1 kg","th":"1 กก."}},{"label":{"en":"Heating source","th":"แหล่งความร้อน"},"value":{"en":"Electromagnetic","th":"แม่เหล็กไฟฟ้า"}},{"label":{"en":"Pot material","th":"วัสดุกระทะ"},"value":{"en":"Compound wok / honeycomb wok (optional)","th":"กระทะคอมพาวด์ / กระทะรังผึ้ง (เลือกได้)"}},{"label":{"en":"Seasoning","th":"เครื่องปรุง"},"value":{"en":"2 types of liquid (oil, water)","th":"ของเหลว 2 ชนิด (น้ำมัน น้ำ)"}},{"label":{"en":"Stir-fry modes","th":"โหมดการผัด"},"value":{"en":"11 combination modes","th":"11 โหมดแบบผสมผสาน"}},{"label":{"en":"Ingredient feeding","th":"การเติมวัตถุดิบ"},"value":{"en":"Auto food delivery module","th":"โมดูลเติมวัตถุดิบอัตโนมัติ"}},{"label":{"en":"Temperature control","th":"การควบคุมอุณหภูมิ"},"value":{"en":"Smart temperature control","th":"ระบบควบคุมอุณหภูมิอัจฉริยะ"}}]},{"title":{"en":"Controls","th":"การควบคุม"},"rows":[{"label":{"en":"Cooking method","th":"วิธีการปรุง"},"value":{"en":"Manual / auto","th":"ควบคุมเอง / อัตโนมัติ"}},{"label":{"en":"Screen","th":"หน้าจอ"},"value":{"en":"7-inch touch LCD colour screen","th":"หน้าจอสัมผัส LCD สี 7 นิ้ว"}}]},{"title":{"en":"Power","th":"พลังงาน"},"rows":[{"label":{"en":"Voltage","th":"แรงดันไฟฟ้า"},"value":{"en":"220 VAC / 380 VAC, 50–60 Hz","th":"220 VAC / 380 VAC, 50–60 Hz"}},{"label":{"en":"Power","th":"กำลังไฟ"},"value":{"en":"5 kW / 8 kW","th":"5 kW / 8 kW"}}]},{"title":{"en":"Size and weight","th":"ขนาดและน้ำหนัก"},"rows":[{"label":{"en":"Dimensions (W × D × H)","th":"ขนาด (ก × ล × ส)"},"value":{"en":"599 × 650 × 470 mm","th":"599 × 650 × 470 มม."}},{"label":{"en":"Net weight","th":"น้ำหนักสุทธิ"},"value":{"en":"35 kg","th":"35 กก."}}]}]}'::jsonb),
  -- Pudu Pudu1
  ('pudu-1', 1140, 'Pudu1', 'Pudu', 'delivery-robots', 'delivery',
   array['pre-owned'], null,
   '{"en":"A pre-owned Pudu delivery robot.","th":"หุ่นยนต์ขนส่ง Pudu ผ่านการใช้งาน"}'::jsonb,
   '{"en":"Pre-owned Pudu Pudu1 delivery robot. Ask us for the specs and a quote.","th":"หุ่นยนต์ขนส่ง Pudu Pudu1 ผ่านการใช้งาน สอบถามสเปกและขอใบเสนอราคาได้จากเรา"}'::jsonb,
   '{"en":[],"th":[]}'::jsonb,
   null),
  -- Pudu Pudu2
  ('pudu-2', 1150, 'Pudu2', 'Pudu', 'delivery-robots', 'delivery',
   array['pre-owned'], null,
   '{"en":"A pre-owned Pudu delivery robot.","th":"หุ่นยนต์ขนส่ง Pudu ผ่านการใช้งาน"}'::jsonb,
   '{"en":"Pre-owned Pudu Pudu2 delivery robot. Ask us for the specs and a quote.","th":"หุ่นยนต์ขนส่ง Pudu Pudu2 ผ่านการใช้งาน สอบถามสเปกและขอใบเสนอราคาได้จากเรา"}'::jsonb,
   '{"en":[],"th":[]}'::jsonb,
   null),
  -- Pudu Bella
  ('pudu-bella', 1160, 'Bella', 'Pudu', 'delivery-robots', 'delivery',
   array['pre-owned'], null,
   '{"en":"A pre-owned Pudu delivery robot.","th":"หุ่นยนต์ขนส่ง Pudu ผ่านการใช้งาน"}'::jsonb,
   '{"en":"Pre-owned Pudu Bella delivery robot. Ask us for the specs and a quote.","th":"หุ่นยนต์ขนส่ง Pudu Bella ผ่านการใช้งาน สอบถามสเปกและขอใบเสนอราคาได้จากเรา"}'::jsonb,
   '{"en":[],"th":[]}'::jsonb,
   null),
  -- Pudu Ketty
  ('pudu-ketty', 1170, 'Ketty', 'Pudu', 'delivery-robots', 'delivery',
   array['pre-owned'], null,
   '{"en":"A pre-owned Pudu delivery robot.","th":"หุ่นยนต์ขนส่ง Pudu ผ่านการใช้งาน"}'::jsonb,
   '{"en":"Pre-owned Pudu Ketty delivery robot. Ask us for the specs and a quote.","th":"หุ่นยนต์ขนส่ง Pudu Ketty ผ่านการใช้งาน สอบถามสเปกและขอใบเสนอราคาได้จากเรา"}'::jsonb,
   '{"en":[],"th":[]}'::jsonb,
   null)
)
insert into public.products
  (id, sort_order, name, brand, category, variant, conditions, image_url,
   tagline, description, features, page, price, preorder, visible)
select
  r.id, r.sort_order, r.name, r.brand, r.category, r.variant, r.conditions,
  r.image_url, r.tagline, r.description, r.features, r.page,
  p.price, false, false
from robots r
left join prices p on p.id = r.id
on conflict (id) do nothing;

commit;

-- Check afterwards (read-only):
--   select id, name, brand, category, variant, conditions, price, visible
--   from products order by sort_order;
--
-- Later, ONLY when the code that shows these robots is live on main:
--   update products set visible = true
--   where id in ('gausium-phantas', 'aventurier-a1-basic', 'aventurier-a1-youth',
--                't-chef-tc-e10a', 'pudu-1', 'pudu-2', 'pudu-bella', 'pudu-ketty');
