import type { Bilingual } from "@/data/siteContent";
import type { CategorySlug } from "@/data/categories";

/**
 * Product pages for lineup models (data/lineup.ts) that are not in the
 * catalogue (Admin → Products) yet, built in code. Each has its own route
 * under app/[locale]/products/<id>/ — a static route, so it wins over the
 * catalogue's [id] page. When the model is added in Admin, delete its route
 * and entry here, or the admin product will be hidden behind this page.
 *
 * Copy rule (data/techAnatomy.ts): every figure and claim traces to the
 * manufacturer's own material, and the photos are the manufacturer's own —
 * for Phantas, Gausium's spec sheet (supplied by the business 2026-09-30);
 * for T-Chef, its official product page (see that entry). Thai lines are
 * DRAFTS for the Thai team.
 */

export interface ModelFigure {
  value: string;
  label: Bilingual;
}

export interface ModelFeature {
  image: string;
  alt: string;
  eyebrow: Bilingual;
  title: Bilingual;
  body: Bilingual;
}

export interface ModelSpecRow {
  label: Bilingual;
  value: Bilingual;
}

export interface ModelSpecGroup {
  title: Bilingual;
  rows: ModelSpecRow[];
}

export interface ModelPage {
  /** Same as the lineup id; the page lives at /products/<id>. */
  id: string;
  category: CategorySlug;
  brand: string;
  name: string;
  /** Second-hand stock: badge in the hero, a Condition row in the specs. */
  preOwned?: boolean;
  /** Transparent studio cut-out for the page's hero. */
  heroImage: { src: string; width: number; height: number };
  eyebrow: Bilingual;
  tagline: Bilingual;
  figures: ModelFigure[];
  features: ModelFeature[];
  specs: ModelSpecGroup[];
  metaDescription: Bilingual;
}

const same = (text: string): Bilingual => ({ en: text, th: text });

export const modelPages: ModelPage[] = [
  {
    id: "gausium-phantas",
    category: "cleaning-robots",
    brand: "Gausium",
    name: "Phantas",
    preOwned: true,
    heroImage: { src: "/studio/phantas-studio.webp", width: 1400, height: 1173 },
    eyebrow: { en: "Gausium · Commercial cleaning robot", th: "Gausium · หุ่นยนต์ทำความสะอาดเชิงพาณิชย์" },
    tagline: {
      en: "Sweeping, scrubbing, vacuuming and mopping in one autonomous robot.",
      th: "กวาด ขัด ดูด และถูพื้น ครบในหุ่นยนต์อัตโนมัติตัวเดียว",
    },
    figures: [
      { value: "400–700 m²/h", label: { en: "Max. cleaning efficiency", th: "ประสิทธิภาพการทำความสะอาดสูงสุด" } },
      { value: "2–4 h", label: { en: "Runtime", th: "ระยะเวลาทำงาน" } },
      { value: "2 h", label: { en: "Charging time", th: "ระยะเวลาชาร์จ" } },
      { value: "10 mm", label: { en: "Smallest obstacle detected", th: "ตรวจจับสิ่งกีดขวางสูงตั้งแต่" } },
    ],
    features: [
      {
        image: "/models/phantas/office.webp",
        alt: "Gausium Phantas in an office",
        eyebrow: { en: "Four cleaning modes", th: "4 โหมดการทำความสะอาด" },
        title: { en: "One robot, four jobs.", th: "หุ่นยนต์ตัวเดียว ทำได้ 4 งาน" },
        body: {
          en: "Phantas sweeps, scrubs, vacuums and mops, with a roller brush and a side brush. It cleans a 410 mm path when sweeping and 330 mm when scrubbing.",
          th: "Phantas กวาด ขัด ดูด และถูพื้นได้ ด้วยแปรงลูกกลิ้งและแปรงข้าง ความกว้างการทำความสะอาด 410 มม. เมื่อกวาด และ 330 มม. เมื่อขัดพื้น",
        },
      },
      {
        image: "/models/phantas/lift.webp",
        alt: "Gausium Phantas scanning in front of a lift",
        eyebrow: { en: "Navigation", th: "ระบบนำทาง" },
        title: { en: "Sees what's in its way.", th: "มองเห็นทุกสิ่งที่ขวางทาง" },
        body: {
          en: "One 2D LiDAR and three 3D cameras map its surroundings, with an electronic bumper as backup. It detects obstacles from 10 mm high and moves at up to 0.8 m/s.",
          th: "LiDAR 2 มิติ 1 ตัว และกล้อง 3 มิติ 3 ตัว ช่วยรับรู้สภาพแวดล้อม พร้อมกันชนอิเล็กทรอนิกส์ ตรวจจับสิ่งกีดขวางสูงตั้งแต่ 10 มม. และเคลื่อนที่ได้เร็วสูงสุด 0.8 ม./วินาที",
        },
      },
      {
        image: "/models/phantas/dock.webp",
        alt: "Gausium Phantas at its charging dock",
        eyebrow: { en: "Power", th: "พลังงาน" },
        title: { en: "Hours of cleaning per charge.", th: "ทำความสะอาดได้นานต่อการชาร์จหนึ่งครั้ง" },
        body: {
          en: "A 40 Ah lithium battery runs for 2 to 4 hours and recharges in 2 hours at its charging dock.",
          th: "แบตเตอรี่ลิเธียม 40 Ah ทำงานได้ 2–4 ชั่วโมง และชาร์จเต็มใน 2 ชั่วโมงที่แท่นชาร์จ",
        },
      },
    ],
    specs: [
      {
        title: { en: "Cleaning", th: "การทำความสะอาด" },
        rows: [
          {
            label: { en: "Functions", th: "ฟังก์ชัน" },
            value: { en: "Sweeping, scrubbing, vacuuming, mopping", th: "กวาด ขัด ดูด ถู" },
          },
          {
            label: { en: "Cleaning width", th: "ความกว้างการทำความสะอาด" },
            value: { en: "410 mm (sweeping) / 330 mm (scrubbing)", th: "410 มม. (กวาด) / 330 มม. (ขัด)" },
          },
          { label: { en: "Brushes", th: "แปรง" }, value: { en: "Roller brush, side brush", th: "แปรงลูกกลิ้ง แปรงข้าง" } },
          { label: { en: "Max. efficiency", th: "ประสิทธิภาพสูงสุด" }, value: same("400–700 m²/h") },
        ],
      },
      {
        title: { en: "Navigation", th: "ระบบนำทาง" },
        rows: [
          {
            label: { en: "Sensors", th: "เซนเซอร์" },
            value: {
              en: "2D LiDAR ×1, 3D camera ×3, electronic bumper ×1",
              th: "LiDAR 2 มิติ ×1, กล้อง 3 มิติ ×3, กันชนอิเล็กทรอนิกส์ ×1",
            },
          },
          { label: { en: "Min. obstacle height detected", th: "ความสูงสิ่งกีดขวางต่ำสุดที่ตรวจจับได้" }, value: { en: "10 mm", th: "10 มม." } },
          { label: { en: "Max. moving speed", th: "ความเร็วสูงสุด" }, value: { en: "0.8 m/s", th: "0.8 ม./วินาที" } },
        ],
      },
      {
        title: { en: "Power", th: "พลังงาน" },
        rows: [
          { label: { en: "Battery", th: "แบตเตอรี่" }, value: { en: "40 Ah lithium", th: "ลิเธียม 40 Ah" } },
          { label: { en: "Runtime", th: "ระยะเวลาทำงาน" }, value: { en: "2–4 h", th: "2–4 ชั่วโมง" } },
          { label: { en: "Charging time", th: "ระยะเวลาชาร์จ" }, value: { en: "2 h", th: "2 ชั่วโมง" } },
          { label: { en: "Charging dock", th: "แท่นชาร์จ" }, value: { en: "Yes", th: "มี" } },
        ],
      },
      {
        title: { en: "Size and weight", th: "ขนาดและน้ำหนัก" },
        rows: [
          { label: { en: "Dimensions (L × W × H)", th: "ขนาด (ย × ก × ส)" }, value: { en: "540 × 440 × 617 mm", th: "540 × 440 × 617 มม." } },
          { label: { en: "Weight", th: "น้ำหนัก" }, value: { en: "48 kg", th: "48 กก." } },
        ],
      },
    ],
    metaDescription: {
      en: "Pre-owned Gausium Phantas commercial cleaning robot in Thailand: sweeping, scrubbing, vacuuming and mopping, 400–700 m²/h, 2–4 h runtime. Get a quote from FindMyRobo.",
      th: "หุ่นยนต์ทำความสะอาดเชิงพาณิชย์ Gausium Phantas (ผ่านการใช้งาน) ในประเทศไทย กวาด ขัด ดูด ถู 400–700 ตร.ม./ชม. ทำงาน 2–4 ชั่วโมง ขอใบเสนอราคาจาก FindMyRobo",
    },
  },
  /*
   * T-Chef TC-E10A. Source: T-Chef's official page,
   * https://en.t-chef.com.cn/products_37/193.html ("E10A Small Intelligent
   * Cooking Robot"), checked 2026-10-01. Figures and specs are from its
   * Technical Parameters tab; the feature claims are the five callouts on its
   * labelled product image (the page has no other feature text). It never
   * says "commercial", so neither do we. Photos: all from ONE image, a
   * high-resolution transparent render of the machine supplied by the
   * business (2026-10-01, with its Robro Chef badge) — the hero and card
   * cut-outs, and one close-up per feature of the part it describes.
   * The Thai text is a DRAFT for the Thai team to review.
   */
  {
    id: "t-chef-tc-e10a",
    category: "cooking-robots",
    brand: "T-Chef",
    name: "TC-E10A",
    preOwned: true,
    heroImage: { src: "/studio/t-chef-studio.webp", width: 1400, height: 1079 },
    eyebrow: { en: "T-Chef · Small intelligent cooking robot", th: "T-Chef · หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก" },
    tagline: {
      en: "A small intelligent cooking robot with automatic food delivery, 11 stir-fry modes and smart temperature control.",
      th: "หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก พร้อมระบบเติมวัตถุดิบอัตโนมัติ โหมดผัด 11 แบบ และระบบควบคุมอุณหภูมิอัจฉริยะ",
    },
    figures: [
      { value: "1 kg", label: { en: "Max. cooking capacity", th: "ปริมาณการปรุงสูงสุด" } },
      { value: "11", label: { en: "Combination stir-fry modes", th: "โหมดผัดแบบผสมผสาน" } },
      { value: "5 kW / 8 kW", label: { en: "Power", th: "กำลังไฟ" } },
      { value: "7-inch", label: { en: "Touch LCD colour screen", th: "หน้าจอสัมผัส LCD สี" } },
    ],
    features: [
      {
        image: "/models/t-chef/feeder.webp",
        alt: "The TC-E10A's three ingredient boxes and auto food delivery module",
        eyebrow: { en: "Auto food delivery", th: "ระบบเติมวัตถุดิบอัตโนมัติ" },
        title: { en: "Ingredients in, hands free.", th: "เติมวัตถุดิบเอง ไม่ต้องใช้มือ" },
        body: {
          en: "Its auto food delivery module adds the ingredients for you, leaving your hands free. It seasons with two types of liquid, oil and water.",
          th: "โมดูลเติมวัตถุดิบอัตโนมัติจะเติมวัตถุดิบให้ คุณจึงไม่ต้องใช้มือ และปรุงรสด้วยของเหลว 2 ชนิด คือ น้ำมันและน้ำ",
        },
      },
      {
        image: "/models/t-chef/wok.webp",
        alt: "The TC-E10A's stirring head and wok",
        eyebrow: { en: "Stir-fry modes", th: "โหมดการผัด" },
        title: { en: "11 ways to stir-fry.", th: "ผัดได้ 11 รูปแบบ" },
        body: {
          en: "11 combination stir-fry modes suit a range of dishes, with smart temperature control and electromagnetic heating. It cooks up to 1 kg, in manual or auto mode.",
          th: "โหมดผัดแบบผสมผสาน 11 แบบ เหมาะกับอาหารหลากหลายเมนู พร้อมระบบควบคุมอุณหภูมิอัจฉริยะและให้ความร้อนแบบแม่เหล็กไฟฟ้า ปรุงได้สูงสุด 1 กก. ทั้งแบบควบคุมเองและอัตโนมัติ",
        },
      },
      {
        image: "/models/t-chef/controls.webp",
        alt: "The TC-E10A's 7-inch touch screen and power buttons",
        eyebrow: { en: "Touch screen", th: "หน้าจอสัมผัส" },
        title: { en: "One-click cooking.", th: "ทำอาหารได้ในคลิกเดียว" },
        body: {
          en: "A 7-inch touch LCD colour screen gives you one-click cooking. At W599 × D650 × H470 mm and 35 kg, its small size suits a variety of settings.",
          th: "หน้าจอสัมผัส LCD สีขนาด 7 นิ้ว สั่งทำอาหารได้ในคลิกเดียว ด้วยขนาด กว้าง 599 × ลึก 650 × สูง 470 มม. และน้ำหนัก 35 กก. ตัวเครื่องขนาดเล็กจึงเหมาะกับการใช้งานหลากหลายสถานที่",
        },
      },
    ],
    specs: [
      {
        title: { en: "Cooking", th: "การปรุงอาหาร" },
        rows: [
          { label: { en: "Max. cooking capacity", th: "ปริมาณการปรุงสูงสุด" }, value: { en: "1 kg", th: "1 กก." } },
          { label: { en: "Heating source", th: "แหล่งความร้อน" }, value: { en: "Electromagnetic", th: "แม่เหล็กไฟฟ้า" } },
          {
            label: { en: "Pot material", th: "วัสดุกระทะ" },
            value: { en: "Compound wok / honeycomb wok (optional)", th: "กระทะคอมพาวด์ / กระทะรังผึ้ง (เลือกได้)" },
          },
          {
            label: { en: "Seasoning", th: "เครื่องปรุง" },
            value: { en: "2 types of liquid (oil, water)", th: "ของเหลว 2 ชนิด (น้ำมัน น้ำ)" },
          },
          { label: { en: "Stir-fry modes", th: "โหมดการผัด" }, value: { en: "11 combination modes", th: "11 โหมดแบบผสมผสาน" } },
          {
            label: { en: "Ingredient feeding", th: "การเติมวัตถุดิบ" },
            value: { en: "Auto food delivery module", th: "โมดูลเติมวัตถุดิบอัตโนมัติ" },
          },
          {
            label: { en: "Temperature control", th: "การควบคุมอุณหภูมิ" },
            value: { en: "Smart temperature control", th: "ระบบควบคุมอุณหภูมิอัจฉริยะ" },
          },
        ],
      },
      {
        title: { en: "Controls", th: "การควบคุม" },
        rows: [
          { label: { en: "Cooking method", th: "วิธีการปรุง" }, value: { en: "Manual / auto", th: "ควบคุมเอง / อัตโนมัติ" } },
          {
            label: { en: "Screen", th: "หน้าจอ" },
            value: { en: "7-inch touch LCD colour screen", th: "หน้าจอสัมผัส LCD สี 7 นิ้ว" },
          },
        ],
      },
      {
        title: { en: "Power", th: "พลังงาน" },
        rows: [
          { label: { en: "Voltage", th: "แรงดันไฟฟ้า" }, value: same("220 VAC / 380 VAC, 50–60 Hz") },
          { label: { en: "Power", th: "กำลังไฟ" }, value: same("5 kW / 8 kW") },
        ],
      },
      {
        title: { en: "Size and weight", th: "ขนาดและน้ำหนัก" },
        rows: [
          {
            label: { en: "Dimensions (W × D × H)", th: "ขนาด (ก × ล × ส)" },
            value: { en: "599 × 650 × 470 mm", th: "599 × 650 × 470 มม." },
          },
          { label: { en: "Net weight", th: "น้ำหนักสุทธิ" }, value: { en: "35 kg", th: "35 กก." } },
        ],
      },
    ],
    metaDescription: {
      en: "Pre-owned T-Chef TC-E10A small intelligent cooking robot in Thailand: auto food delivery, 11 combination stir-fry modes, up to 1 kg, 7-inch touch screen. Get a quote from FindMyRobo.",
      th: "หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก T-Chef TC-E10A (ผ่านการใช้งาน) ในประเทศไทย เติมวัตถุดิบอัตโนมัติ โหมดผัดแบบผสมผสาน 11 แบบ ปรุงได้สูงสุด 1 กก. หน้าจอสัมผัส 7 นิ้ว ขอใบเสนอราคาจาก FindMyRobo",
    },
  },
];

export const getModelPage = (id: string) => modelPages.find((page) => page.id === id);
