/**
 * "Under the hood" — the interactive anatomy section on the home page.
 *
 * SCOPE: LUBA 3 AWD 3000 / 5000 and LUBA mini 2 AWD 1500 only. Deliberately
 * excludes Yuka, Yuka mini, and Spino — Yuka mini 2 is preorder-only and must
 * not be presented as a main product.
 *
 * ⚠️ SOURCING RULE — every sentence below must trace to the user manual, the
 * spec table, or something visible in the photographs. Do not describe
 * behaviour that is merely implied: an earlier draft claimed blades "swing back
 * instead of snapping" and were "replaced with a screwdriver, not a service
 * visit", both extrapolated from the single word "pivoting". Those are
 * warranty-adjacent promises a customer can hold the company to. If a claim
 * cannot be sourced, leave it out and ask the supplier.
 *
 * SOURCES, per entry:
 *   manual   — LUBA 3 AWD user manual (parts diagram / feature text)
 *   photo    — visible and countable in /public/robot/*.png
 *   spec     — brochure specification table
 *   mammotion— Mammotion's own product listing (us.mammotion.com)
 *
 * ⚠️ STILL UNCONFIRMED, flagged for the supplier:
 *   - LiDAR range: brochure spec table says 70 m, brochure marketing page says
 *     100 m. 70 m is used here as the conservative figure.
 *   - "300+ objects" and the 5 TOPS chip come from the brochure, not the manual.
 *   - Omni wheel POSITION on the diagram is a best guess; confirm before launch.
 *
 * ⚠️ LUBA mini 2 AWD 1500 figures are not included — that model's spec table
 * was not supplied. Figures are LUBA 3 AWD, quoting the 5000 where models differ.
 */

export interface Bilingual {
  en: string;
  th: string;
}

export type ViewId = "frontLeft" | "under" | "sideLeft" | "sideRight" | "top";

/** The product renders. All are 2048×2048 on a transparent background. */
export const views: Record<ViewId, { src: string; label: Bilingual }> = {
  frontLeft: {
    src: "/robot/front-left.png",
    label: { en: "Front three-quarter", th: "มุมเฉียงด้านหน้า" },
  },
  under: {
    src: "/robot/under.png",
    label: { en: "Underside", th: "ด้านใต้เครื่อง" },
  },
  sideLeft: {
    src: "/robot/side-left.png",
    label: { en: "Left side", th: "ด้านซ้าย" },
  },
  sideRight: {
    src: "/robot/side-right.png",
    label: { en: "Right side", th: "ด้านขวา" },
  },
  top: {
    src: "/robot/top.png",
    label: { en: "Top view", th: "มุมมองด้านบน" },
  },
};

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

export const techAnatomy: Hotspot[] = [
  {
    // manual (parts diagram #2) + spec
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
    // mammotion — "AI Vision" is one of the three Tri-Fusion systems
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
    // photo (top view) — the antenna marked with a satellite icon and DO NOT COVER
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
    // photo (underside) + spec — 80% slope, four in-wheel motors
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
    // mammotion — the omni wheel is what lets it pivot without tearing turf.
    // ⚠️ position on the diagram is a best guess; confirm against the manual.
    id: "omni",
    view: "top",
    x: 33,
    y: 27,
    zoom: 2.4,
    title: { en: "Omni wheel", th: "ล้อออมนิ" },
    body: {
      en: "Lets the robot pivot on the spot instead of dragging a fixed wheel sideways through the turf. That is what keeps tight turns from scuffing bare patches into a lawn.",
      th: "ช่วยให้หุ่นยนต์หมุนตัวอยู่กับที่ได้ แทนที่จะลากล้อตายไถลไปกับสนามหญ้า จึงเลี้ยวในวงแคบได้โดยไม่ทำให้หญ้าถลอกเป็นหย่อม",
    },
    stat: "360°",
    statLabel: { en: "pivot turns without scuffing", th: "หมุนรอบตัวโดยไม่ทำหญ้าถลอก" },
  },
  {
    // manual (parts diagram #6) + customer-supplied behaviour description
    id: "bumper",
    view: "top",
    x: 24,
    y: 48,
    zoom: 1.8,
    title: { en: "Bumper sensor", th: "เซ็นเซอร์กันชน" },
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
    // photo (underside) + spec — 400 mm width, 25-70 mm height (manual)
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
];
