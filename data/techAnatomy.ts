import type { RobotVariant } from "@/data/products";

/**
 * "Under the hood" — the interactive anatomy shown on a robot's product page.
 *
 * ⚠️ SOURCING RULE — every sentence below must trace to the user manual, its
 * specification table, or something visible in the photographs. Do not describe
 * behaviour that is merely implied: an earlier draft claimed blades "swing back
 * instead of snapping" and were "replaced with a screwdriver, not a service
 * visit", both extrapolated from the single word "pivoting". Those are
 * warranty-adjacent promises a customer can hold the company to. If a claim
 * cannot be sourced, leave it out and ask the supplier.
 *
 * WHICH SET A PRODUCT GETS is decided by its `variant`, so nothing has to be
 * configured per product in the admin panel — a new LUBA 3 listing picks up the
 * LUBA 3 anatomy automatically. Variants with no entry simply render nothing.
 *
 * ⚠️ STILL UNCONFIRMED (LUBA 3 only), flagged for the supplier:
 *   - LiDAR range: brochure spec table says 70 m, marketing page says 100 m.
 *     70 m is used as the conservative figure.
 *   - "300+ objects" and the 5 TOPS chip come from the brochure, not the manual.
 */

export interface Bilingual {
  en: string;
  th: string;
}

export type ViewId = "frontLeft" | "under" | "sideLeft" | "sideRight" | "top";

export interface Hotspot {
  id: string;
  view: ViewId;
  /** Percentage position of the component within its view. */
  x: number;
  y: number;
  /** Magnification when selected. */
  zoom: number;
  title: Bilingual;
  body: Bilingual;
  stat: string;
  statLabel: Bilingual;
}

export interface AnatomySet {
  /** Shown in the section eyebrow, so figures are never read as generic. */
  model: string;
  /** Only the views actually referenced by a hotspot need an entry. */
  views: Partial<Record<ViewId, { src: string; label: Bilingual }>>;
  hotspots: Hotspot[];
  footnote: Bilingual;
}

const VIEW_LABELS: Record<ViewId, Bilingual> = {
  frontLeft: { en: "Front three-quarter", th: "มุมเฉียงด้านหน้า" },
  under: { en: "Underside", th: "ด้านใต้เครื่อง" },
  sideLeft: { en: "Left side", th: "ด้านซ้าย" },
  sideRight: { en: "Right side", th: "ด้านขวา" },
  top: { en: "Top view", th: "มุมมองด้านบน" },
};

/**
 * Cloudinary delivery.
 *
 * f_auto picks WebP or AVIF per browser. q_auto:best rather than plain q_auto
 * because these renders are magnified up to ~3×, and the normal setting — tuned
 * for viewing at natural size — leaves artefacts that become obvious zoomed in.
 *
 * TechAnatomy serves https:// sources directly instead of through next/image:
 * re-encoding an already-optimised file is a second lossy pass, and that is
 * exactly what softened these when they were local.
 */
const cld = (path: string) =>
  `https://res.cloudinary.com/ddb7pxqfd/image/upload/f_auto,q_auto:best/${path}`;

const LUBA3_URLS: Record<ViewId, string> = {
  frontLeft: cld("v1785746889/luba3-1_y5n1uc.png"),
  top: cld("v1784180517/luba3-2_uuukgg.png"),
  sideLeft: cld("v1785750522/luba3-3_jd3ef9.png"),
  sideRight: cld("v1784180517/luba3-4_m3d2l2.png"),
  under: cld("v1784181000/luba3-5_bv5dfg.png"),
};

const MINI2_URLS: Record<ViewId, string> = {
  frontLeft: cld("v1785747825/3e91f791-5c40-42bd-aa9c-9b9860eceff8_nzlyly.png"),
  top: cld("v1785747758/97f9e0fa-5403-4f76-881e-8ac7524fa03e_raxxym.png"),
  sideLeft: cld("v1785747683/2_k6bkaj.png"),
  sideRight: cld("v1785669635/7952672d-c8f4-4f5c-8e03-02f3d123fca3_uefwx2.png"),
  under: cld("v1785669962/f425735b-d975-4a6b-bf79-12aab8bae15c_gfwjrt.png"),
};

/**
 * Only the views a hotspot actually uses. Every listed view is mounted at once
 * so switching never waits on a request — which also means listing an unused
 * one would download it for nothing. Add a view here when a hotspot needs it.
 */
const viewsFrom = (
  urls: Record<ViewId, string>,
  ids: ViewId[]
): AnatomySet["views"] =>
  Object.fromEntries(
    ids.map((id) => [id, { src: urls[id], label: VIEW_LABELS[id] }])
  );

/* ------------------------------------------------------------ LUBA 3 AWD */

const luba3: AnatomySet = {
  model: "LUBA 3 AWD",
  views: viewsFrom(LUBA3_URLS, ["frontLeft", "under", "top"]),
  footnote: {
    en: "Figures are for LUBA 3 AWD 3000 and 5000, quoting the 5000 where the two differ. Specifications are subject to confirmation with the supplier.",
    th: "ข้อมูลจำเพาะสำหรับรุ่น LUBA 3 AWD 3000 และ 5000 โดยอ้างอิงรุ่น 5000 ในกรณีที่ทั้งสองรุ่นต่างกัน ข้อมูลอยู่ระหว่างการยืนยันกับผู้จัดจำหน่าย",
  },
  hotspots: [
    {
      // manual (parts diagram) + spec table
      id: "lidar",
      view: "frontLeft",
      x: 46,
      y: 33,
      zoom: 1.7,
      title: { en: "360° LiDAR", th: "LiDAR 360°" },
      body: {
        en: "The dome on top spins a laser to map everything around the robot — in daylight, at dusk, or in the dark. It reads shape and distance rather than colour, so shadows and glare don't fool it.",
        th: "โดมด้านบนหมุนเลเซอร์เพื่อสร้างแผนที่สิ่งรอบข้าง ทั้งกลางวัน ตอนพลบค่ำ หรือกลางคืน อ่านรูปทรงและระยะทางแทนสี เงาและแสงสะท้อนจึงไม่รบกวนการทำงาน",
      },
      stat: "70 m",
      statLabel: { en: "scan range, 360° × 59°", th: "ระยะสแกน 360° × 59°" },
    },
    {
      // mammotion listing — "AI Vision" is one of the three Tri-Fusion systems
      id: "vision",
      view: "frontLeft",
      x: 40,
      y: 41,
      zoom: 1.8,
      title: { en: "Dual-camera AI vision", th: "AI วิชันสองกล้อง" },
      body: {
        en: "Two forward-facing cameras feed an on-board AI chip that recognises what it is looking at — a hose, a toy, a sleeping cat — and steers around it instead of over it.",
        th: "กล้องคู่ด้านหน้าส่งภาพให้ชิป AI ในตัวเครื่องประมวลผล รู้จำสิ่งที่เห็น ทั้งสายยาง ของเล่น หรือแมวที่นอนอยู่ แล้วหลบไปแทนที่จะทับผ่าน",
      },
      stat: "300+",
      statLabel: { en: "objects recognised, 5 TOPS chip", th: "วัตถุที่รู้จำได้ ด้วยชิป 5 TOPS" },
    },
    {
      // photo (top view) — antenna marked with a satellite icon and DO NOT COVER
      id: "netrtk",
      view: "top",
      x: 50,
      y: 77,
      zoom: 1.8,
      title: { en: "NetRTK positioning", th: "ระบบระบุตำแหน่ง NetRTK" },
      body: {
        en: "The satellite antenna sits at the tail, marked \"do not cover\". It gets centimetre-accurate positioning over the mobile network — so unlike RTK systems that need their own base station, there is nothing to mount on a pole in your garden.",
        th: "เสาอากาศรับสัญญาณดาวเทียมอยู่ด้านท้ายเครื่อง มีข้อความกำกับว่าห้ามปิดทับ รับตำแหน่งแม่นยำระดับเซนติเมตรผ่านเครือข่ายมือถือ ต่างจากระบบ RTK ที่ต้องมีสถานีฐานของตัวเอง จึงไม่ต้องติดตั้งเสาใดๆ ในสวนของคุณ",
      },
      stat: "0",
      statLabel: { en: "base stations to install", th: "สถานีฐานที่ต้องติดตั้ง" },
    },
    {
      // photo (underside) + spec — 80% slope
      id: "awd",
      view: "under",
      x: 48,
      y: 27,
      zoom: 1.6,
      title: { en: "All-wheel drive", th: "ระบบขับเคลื่อนสี่ล้อ" },
      body: {
        en: "Four independently powered wheels on articulated suspension, so each wheel tracks the ground separately over banks and uneven lawns.",
        th: "ล้อขับเคลื่อนอิสระทั้งสี่ล้อบนระบบกันสะเทือนแบบข้อต่อ แต่ละล้อยึดเกาะพื้นแยกจากกัน ทั้งบนเนินและสนามที่ไม่เรียบ",
      },
      stat: "38.6°",
      statLabel: { en: "80% slope climbing", th: "ไต่ทางลาดชัน 80%" },
    },
    {
      // photo (top view) — the barrel-roller wheels at the front
      id: "omni",
      view: "top",
      x: 32,
      y: 27,
      zoom: 2.4,
      title: { en: "Omni wheel", th: "ล้อออมนิ" },
      body: {
        en: "The front wheels are built from angled rollers, so they can slide sideways as well as roll forward. That lets the robot pivot on the spot instead of dragging a fixed wheel through the turf.",
        th: "ล้อหน้าประกอบด้วยลูกกลิ้งวางเฉียง จึงเลื่อนด้านข้างได้พร้อมกับหมุนไปข้างหน้า ช่วยให้หุ่นยนต์หมุนตัวอยู่กับที่ได้ แทนที่จะลากล้อตายไถลไปกับสนามหญ้า",
      },
      stat: "360°",
      statLabel: { en: "pivot turns", th: "หมุนรอบตัวได้" },
    },
    {
      // manual (parts diagram) + customer-supplied behaviour description.
      // Front bar, not the orange side guards — the bumper only triggers on
      // forward contact, which is the direction the robot actually travels.
      id: "bumper",
      view: "top",
      x: 50,
      y: 13,
      zoom: 1.8,
      title: { en: "Physical bumper", th: "กันชนกลไก" },
      body: {
        en: "The last line of defence behind the cameras and LiDAR. If the bumper makes contact with something, it presses in and triggers the sensor — the robot stops, then plans a new route around it.",
        th: "ด่านสุดท้ายถัดจากกล้องและ LiDAR หากกันชนสัมผัสกับสิ่งกีดขวาง กันชนจะถูกกดและสั่งงานเซ็นเซอร์ หุ่นยนต์จะหยุด แล้ววางเส้นทางใหม่เพื่อเลี่ยงสิ่งนั้น",
      },
      stat: "Stop",
      statLabel: { en: "then reroute, on contact", th: "แล้ววางเส้นทางใหม่เมื่อสัมผัส" },
    },
    {
      // manual — "Rain Detection ... Settings > Rain Protection"
      id: "rain",
      view: "top",
      x: 50,
      y: 55,
      zoom: 2.2,
      title: { en: "Rain sensor", th: "เซ็นเซอร์ตรวจจับฝน" },
      body: {
        en: "Built-in rain sensors on the deck. With rain protection enabled, the robot stops mowing and returns to its charging station on its own as soon as rain is detected — which matters through a Thai rainy season.",
        th: "เซ็นเซอร์ตรวจจับฝนติดตั้งอยู่บนตัวเครื่อง เมื่อเปิดใช้งานระบบป้องกันฝน หุ่นยนต์จะหยุดตัดหญ้าและกลับไปยังแท่นชาร์จเองทันทีที่ตรวจพบฝน ซึ่งสำคัญมากสำหรับหน้าฝนเมืองไทย",
      },
      stat: "Auto",
      statLabel: { en: "returns to dock when rain starts", th: "กลับแท่นชาร์จเองเมื่อฝนตก" },
    },
    {
      // photo (underside) + spec — 400 mm width, 25-70 mm height
      id: "discs",
      view: "under",
      x: 48,
      y: 50,
      zoom: 1.5,
      title: { en: "Cutting discs and height", th: "จานตัดและการปรับความสูง" },
      body: {
        en: "Two discs cover a 400 mm swath in a single pass. Cutting height is set with the adjustment knob on top, from a close finish right up to long rainy-season grass.",
        th: "จานตัดสองชุด ตัดหน้ากว้าง 400 มม. ในรอบเดียว ปรับความสูงการตัดได้ด้วยปุ่มปรับด้านบนเครื่อง ตั้งแต่ตัดสั้นเรียบไปจนถึงหญ้ายาวช่วงหน้าฝน",
      },
      stat: "25–70 mm",
      statLabel: { en: "adjustable cutting height", th: "ปรับความสูงการตัดได้" },
    },
    {
      // photo (underside) — counted: six blades around each of the two discs
      id: "blades",
      view: "under",
      x: 31,
      y: 50,
      zoom: 2.1,
      title: { en: "Pivoting razor blades", th: "ใบมีดแบบพับได้" },
      body: {
        en: "Twelve blades in total, six around each disc. Every one is held by a single fastener, so it pivots rather than sitting rigid.",
        th: "ใบมีดทั้งหมด 12 ใบ จานละหกใบ แต่ละใบยึดด้วยตัวยึดเพียงจุดเดียว จึงหมุนพับได้แทนที่จะยึดตาย",
      },
      stat: "12",
      statLabel: { en: "blades, six per disc", th: "ใบมีด จานละหกใบ" },
    },
  ],
};

/* ------------------------------------------------ LUBA mini 2 AWD 1500 */
/* Every figure below is from the LUBA mini 2 AWD user manual (v1.0, 05/2026),
   model LM2S1. Note this model navigates by 360° LiDAR + AI Vision — it has
   NO NetRTK, unlike LUBA 3 AWD. Its GNSS is for theft tracking only. */

const lubaMini2: AnatomySet = {
  model: "LUBA mini 2 AWD 1500",
  views: viewsFrom(MINI2_URLS, ["top", "under"]),
  footnote: {
    en: "Figures are for LUBA mini 2 AWD 1500 (model LM2S1), from the Mammotion user manual v1.0.",
    th: "ข้อมูลจำเพาะสำหรับรุ่น LUBA mini 2 AWD 1500 (รุ่น LM2S1) จากคู่มือผู้ใช้ Mammotion เวอร์ชัน 1.0",
  },
  hotspots: [
    {
      // manual parts diagram #4 "Vision Module/LiDAR Module" + spec
      // "Positioning & Navigation: 360° LiDAR & AI Vision"
      id: "lidar",
      view: "top",
      x: 52,
      y: 43,
      zoom: 1.6,
      title: { en: "360° LiDAR and AI vision", th: "LiDAR 360° และ AI วิชัน" },
      body: {
        en: "One module carries both the spinning laser scanner and the cameras. Together they map the lawn and recognise obstacles — no boundary wire to bury, and no base station to install.",
        th: "โมดูลเดียวรวมทั้งเลเซอร์สแกนเนอร์แบบหมุนและกล้อง ทำงานร่วมกันเพื่อสร้างแผนที่สนามและตรวจจับสิ่งกีดขวาง ไม่ต้องฝังสายรอบสนาม และไม่ต้องติดตั้งสถานีฐาน",
      },
      stat: "360°",
      statLabel: { en: "LiDAR with AI vision", th: "LiDAR พร้อม AI วิชัน" },
    },
    {
      // manual parts diagram #3 Rain Sensor + 5.3 Rain Detection
      id: "rain",
      view: "top",
      x: 51,
      y: 54,
      zoom: 1.6,
      title: { en: "Rain sensor", th: "เซ็นเซอร์ตรวจจับฝน" },
      body: {
        en: "Built-in rain sensors on the deck. With rain protection enabled, the robot stops mowing and returns to the charging station by itself as soon as rain is detected.",
        th: "เซ็นเซอร์ตรวจจับฝนติดตั้งอยู่บนตัวเครื่อง เมื่อเปิดใช้งานระบบป้องกันฝน หุ่นยนต์จะหยุดตัดหญ้าและกลับไปยังแท่นชาร์จเองทันทีที่ตรวจพบฝน",
      },
      stat: "Auto",
      statLabel: { en: "returns to dock when rain starts", th: "กลับแท่นชาร์จเองเมื่อฝนตก" },
    },
    {
      // manual parts diagram #6 Bumper + spec "Obstacle Avoidance: ... Physical Bumper"
      id: "bumper",
      view: "top",
      x: 50,
      y: 15,
      zoom: 1.6,
      title: { en: "Physical bumper", th: "กันชนกลไก" },
      body: {
        en: "Listed in the specification as part of the obstacle-avoidance system alongside the LiDAR and cameras. If contact is made, the bumper presses in, the robot stops, and it plans a new route around whatever it touched.",
        th: "ระบุในข้อมูลจำเพาะว่าเป็นส่วนหนึ่งของระบบหลบสิ่งกีดขวาง ร่วมกับ LiDAR และกล้อง เมื่อมีการสัมผัส กันชนจะถูกกด หุ่นยนต์จะหยุด แล้ววางเส้นทางใหม่เพื่อเลี่ยงสิ่งนั้น",
      },
      stat: "Stop",
      statLabel: { en: "then reroute, on contact", th: "แล้ววางเส้นทางใหม่เมื่อสัมผัส" },
    },
    {
      // manual parts diagram #10 Omni Wheel — visibly a barrel-roller wheel
      id: "omni",
      view: "top",
      x: 29,
      y: 29,
      zoom: 2,
      title: { en: "Omni wheel", th: "ล้อออมนิ" },
      body: {
        en: "The front wheels are built from angled rollers rather than a single tyre, so they can slide sideways as well as roll forward. That lets the robot turn on the spot instead of dragging a fixed wheel through the turf.",
        th: "ล้อหน้าประกอบด้วยลูกกลิ้งวางเฉียงแทนที่จะเป็นยางชิ้นเดียว จึงเลื่อนด้านข้างได้พร้อมกับหมุนไปข้างหน้า ช่วยให้หุ่นยนต์หมุนตัวอยู่กับที่ แทนที่จะลากล้อตายไถลไปกับสนามหญ้า",
      },
      stat: "360°",
      statLabel: { en: "pivot turns", th: "หมุนรอบตัวได้" },
    },
    {
      // manual — "GPS Theft Tracking: YES", "Geo-fence Alarm: YES" (5.4)
      id: "tracking",
      view: "top",
      x: 51,
      y: 77,
      zoom: 1.7,
      title: { en: "GPS theft tracking", th: "ติดตามตำแหน่งป้องกันการโจรกรรม" },
      body: {
        en: "The satellite antenna at the tail, marked \"do not cover\". The app warns you if the robot moves more than 50 m from its task area, and can track its location if it goes missing.",
        th: "เสาอากาศรับสัญญาณดาวเทียมอยู่ด้านท้ายเครื่อง มีข้อความกำกับว่าห้ามปิดทับ แอปจะแจ้งเตือนหากหุ่นยนต์เคลื่อนออกจากพื้นที่ทำงานเกิน 50 เมตร และติดตามตำแหน่งได้หากเครื่องหาย",
      },
      stat: "50 m",
      statLabel: { en: "geo-fence alert radius", th: "รัศมีแจ้งเตือนพื้นที่" },
    },
    {
      // manual parts diagram #9 Rear Wheel + spec "Engine: All-wheel-Drive (AWD)",
      // "Max Slope inside Task Area: 80% (38.6°)"
      id: "awd",
      view: "under",
      x: 50,
      y: 70,
      zoom: 1.4,
      title: { en: "All-wheel drive", th: "ระบบขับเคลื่อนสี่ล้อ" },
      body: {
        en: "All-wheel drive on independent suspension. The manual rates it to 80% inside a task area, and it steps over vertical obstacles up to 45 mm without being lifted.",
        th: "ระบบขับเคลื่อนสี่ล้อบนช่วงล่างอิสระ คู่มือระบุความสามารถไต่ทางลาดถึง 80% ภายในพื้นที่ทำงาน และข้ามสิ่งกีดขวางแนวตั้งสูงถึง 45 มม. ได้โดยไม่ต้องยก",
      },
      stat: "38.6°",
      statLabel: { en: "80% slope climbing", th: "ไต่ทางลาดชัน 80%" },
    },
    {
      // manual spec — "Main Cutting Disc: 200 mm", "Cutting Height 20-65 mm"
      id: "mainDisc",
      view: "under",
      x: 50,
      y: 50,
      zoom: 1.5,
      title: { en: "Main cutting disc", th: "จานตัดหลัก" },
      body: {
        en: "The large disc does the bulk of the mowing across a 200 mm swath, with cutting height adjustable from a close finish to long rainy-season grass.",
        th: "จานตัดขนาดใหญ่ทำหน้าที่ตัดหญ้าเป็นหลัก หน้ากว้าง 200 มม. ปรับความสูงการตัดได้ตั้งแต่ตัดสั้นเรียบไปจนถึงหญ้ายาวช่วงหน้าฝน",
      },
      stat: "20–65 mm",
      statLabel: { en: "cutting height, 200 mm width", th: "ความสูงการตัด หน้ากว้าง 200 มม." },
    },
    {
      // manual spec — "Edge Cutting Disc: 120 mm", fixed at 50 mm
      id: "edgeDisc",
      view: "under",
      x: 32,
      y: 50,
      zoom: 1.6,
      title: { en: "Edge cutting disc", th: "จานตัดขอบ" },
      body: {
        en: "A second, smaller disc set out to the side. It reaches into the strip along walls and borders that a single centre-mounted disc always leaves behind — so there is far less to finish by hand.",
        th: "จานตัดชุดที่สองขนาดเล็กกว่า ติดตั้งเยื้องออกด้านข้าง เข้าถึงแนวหญ้าริมกำแพงและขอบสนามที่จานตัดกลางเครื่องเพียงชุดเดียวมักตัดไม่ถึง จึงเหลืองานเก็บด้วยมือน้อยลงมาก",
      },
      stat: "120 mm",
      statLabel: { en: "edge cutting width", th: "หน้ากว้างการตัดขอบ" },
    },
    {
      // manual parts diagram #14 Removable Battery + spec 21.6 V, 6.1 Ah
      id: "battery",
      view: "under",
      x: 50,
      y: 78,
      zoom: 1.5,
      title: { en: "Removable battery", th: "แบตเตอรี่ถอดเปลี่ยนได้" },
      body: {
        en: "The battery slides out rather than being sealed in, so it can be charged or replaced without sending the whole machine away. The manual rates 150 minutes of mowing per charge.",
        th: "แบตเตอรี่ถอดออกได้ ไม่ได้ปิดผนึกอยู่ในตัวเครื่อง จึงชาร์จหรือเปลี่ยนได้โดยไม่ต้องส่งเครื่องทั้งตัวไปศูนย์บริการ คู่มือระบุระยะเวลาตัดหญ้า 150 นาทีต่อการชาร์จหนึ่งครั้ง",
      },
      stat: "150 min",
      statLabel: { en: "mowing per charge", th: "ตัดหญ้าต่อการชาร์จ" },
    },
  ],
};

/** Anatomy by robot variant. Variants absent here render no section at all. */
export const anatomyByVariant: Partial<Record<RobotVariant, AnatomySet>> = {
  luba: luba3,
  mini: lubaMini2,
};
