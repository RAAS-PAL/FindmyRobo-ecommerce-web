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
 * manufacturer's spec sheet (supplied by the business 2026-09-30); the
 * photos are Gausium's own. Thai lines are DRAFTS for the Thai team.
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
      en: "Gausium Phantas commercial cleaning robot in Thailand: sweeping, scrubbing, vacuuming and mopping, 400–700 m²/h, 2–4 h runtime. Get a quote from FindMyRobo.",
      th: "หุ่นยนต์ทำความสะอาดเชิงพาณิชย์ Gausium Phantas ในประเทศไทย กวาด ขัด ดูด ถู 400–700 ตร.ม./ชม. ทำงาน 2–4 ชั่วโมง ขอใบเสนอราคาจาก FindMyRobo",
    },
  },
];

export const getModelPage = (id: string) => modelPages.find((page) => page.id === id);
