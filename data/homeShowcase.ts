import type { Bilingual } from "@/data/siteContent";
import type { QuoteInterest } from "@/lib/quoteRequest";
import type { CategorySlug } from "@/data/categories";
import type { Product } from "@/data/products";

/**
 * Homepage robot showcase: the hero slides and the product-family banners
 * under them (DJI-style layout, 2026-09-30).
 *
 * Order is priority. Lawn mowing and Gausium Phantas lead (hero slides and
 * full-width banners); Pudu and T-Chef follow as half-width tiles.
 *
 * `image: null` renders a labelled placeholder (components/ui/PhotoSlot) that
 * describes the shot wanted — swap in a /public path when the photo arrives.
 * `focus` is the CSS object-position that keeps the robot in frame when the
 * photo is cropped.
 *
 * Copy rule (data/techAnatomy.ts): claims must trace to the manufacturer's
 * spec sheet, so these lines stay descriptive until those arrive. The Thai
 * lines for Phantas, Pudu and T-Chef are DRAFTS pending the Thai team's review.
 *
 * Will move into the CMS (Homepage global) once the layout is approved.
 */

/** A cut-out placed on a StudioStage; positions are % of the stage. */
export interface StudioRobot {
  src: string;
  alt: string;
  /** Intrinsic size of the (trimmed) cut-out. */
  width: number;
  height: number;
  phone: { left: string; bottom: string; width: string };
  desktop: { left: string; bottom: string; width: string };
  /** Stacking: the nearer robot is higher. */
  z?: number;
}

/** Offsets from the stage's edges (any CSS length). */
export interface StageBox {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

/**
 * A full studio photograph on the set, rather than cut-outs: it has its own
 * floor and reflection, and its edges fade into the set. It is drawn as large
 * as fits inside `box` without cropping, at its own aspect ratio, so it can
 * never run under the navbar or into the headline, whatever the screen shape.
 */
export interface StudioPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  phone: StageBox;
  desktop: StageBox;
  /**
   * Fade the photo's edges into the set — for a photo with its own backdrop.
   * Off for a transparent cut-out, whose edges are already clear (and the
   * fade would eat into the robot). Default true.
   */
  fade?: boolean;
}

export interface ShowcasePhoto {
  image: string | null;
  /**
   * Instead of a photo: product cut-outs on a graphite studio set
   * (components/ui/StudioStage). Wins over `image`.
   */
  studio?: StudioRobot[];
  /** A finished studio photo on the set (wins over `studio` cut-outs). */
  studioPhoto?: StudioPhoto;
  /** The studio's key light: soft white, or the brand blue. Default blue. */
  studioLight?: "neutral" | "accent";
  focus?: string;
  /** Below sm, when the phone crop needs a different point (defaults to focus). */
  focusPhone?: string;
  /**
   * A transparent product cut-out on a light studio backdrop drawn in CSS,
   * instead of a photo. The backdrop always fills the whole card, and the
   * machine is placed (object-contain) in the card's lower part, clear of
   * the title and buttons, so no image edge can show at any card shape.
   */
  cutout?: { src: string; width: number; height: number };
  /** What the placeholder asks for while `image` is null. */
  shot: Bilingual;
}

export interface HeroSlide extends ShowcasePhoto {
  id: string;
  /** The tab under the hero. */
  tab: Bilingual;
  eyebrow: Bilingual;
  /** null: use the CMS hero headline (Admin → Content → Homepage). */
  headline: Bilingual | null;
  accent: Bilingual | null;
  sub: Bilingual | null;
  /** "Explore" link target. */
  href: string;
  /** Preselects the quote form's robot. */
  interest: QuoteInterest;
  /** A single robot's slide: shown only while that product is on show, and
   *  its quote button names it. */
  productId?: string;
  /** A family's slide: shown only while that category has a robot on show. */
  category?: CategorySlug;
}

export interface RobotFamily extends ShowcasePhoto {
  id: string;
  /** Where the title sits on the photo — away from the robot. Default top. */
  copyAt?: "top" | "bottom";
  eyebrow: Bilingual;
  title: Bilingual;
  tagline: Bilingual;
  /** "Learn more" target; null when there is no page yet. */
  href: string | null;
  interest: QuoteInterest;
  /** A single robot's banner: shown only while that product is on show, and
   *  its quote button names it. */
  productId?: string;
  /** A family's banner: shown only while that category has a robot on show. */
  category?: CategorySlug;
}

/**
 * The slides and banners whose robots are on the storefront. One whose robot
 * is still hidden in Admin (no photos or specs yet) is left out, and comes
 * back by itself once the robot is switched on.
 */
export function onShow<
  T extends {
    productId?: string;
    category?: CategorySlug;
    image: string | null;
    cutout?: { src: string };
    studioPhoto?: { src: string };
    studio?: readonly unknown[];
  },
>(items: T[], products: Pick<Product, "id" | "category">[]): T[] {
  return items.filter((item) => {
    const listed =
      (!item.productId || products.some((p) => p.id === item.productId)) &&
      (!item.category || products.some((p) => p.category === item.category));
    // A "photo coming" frame is for layout review. It must not ship as a
    // blank card once a robot in that family is switched on.
    const pictured = Boolean(item.image || item.cutout || item.studioPhoto || item.studio?.length);
    return listed && pictured;
  });
}

export const heroSlides: HeroSlide[] = [
  // Each slide is a transparent cut-out (`cutout`) of the family's robot on
  // the hero's lit canvas (HeroSection). Lawn mowing leads with the CMS
  // headline; the others carry their own copy. A slide shows only while its
  // robot (productId) or a robot in its category is on show in Admin.
  {
    id: "lawn",
    tab: { en: "Lawn mowing", th: "หุ่นยนต์ตัดหญ้า" },
    eyebrow: { en: "Mammotion · Robot lawn mowers", th: "Mammotion · หุ่นยนต์ตัดหญ้า" },
    headline: null,
    accent: null,
    sub: null,
    href: "/shop/robot-mowers",
    interest: "lawn-mowing",
    image: null,
    // the LUBA 3 AWD cut-out (not mirrored: that would print MAMMOTION backwards)
    cutout: { src: "/studio/luba-orange.webp", width: 1846, height: 958 },
    shot: { en: "", th: "" },
  },
  {
    id: "phantas",
    tab: { en: "Commercial cleaning", th: "ทำความสะอาดเชิงพาณิชย์" },
    // sold new and pre-owned: said in the slide itself (business, 2026-10-01)
    eyebrow: { en: "Gausium · Brand-new or pre-owned", th: "Gausium · เครื่องใหม่ หรือผ่านการใช้งาน" },
    headline: { en: "Gausium Phantas.", th: "Gausium Phantas" },
    accent: { en: "Clean floors, every shift.", th: "พื้นสะอาด ทุกกะการทำงาน" },
    sub: {
      en: "Autonomous floor cleaning for offices, hotels and shops. Tell us about your site and we’ll quote the right setup.",
      th: "หุ่นยนต์ทำความสะอาดพื้นอัตโนมัติ สำหรับสำนักงาน โรงแรม และร้านค้า บอกเราเกี่ยวกับพื้นที่ของคุณ แล้วเราจะเสนอราคาที่เหมาะสม",
    },
    href: "/products/gausium-phantas",
    interest: "commercial-cleaning",
    productId: "gausium-phantas",
    image: null,
    // Gausium's transparent product render, with its own soft floor glow
    cutout: { src: "/studio/phantas-studio.webp", width: 1400, height: 1173 },
    shot: { en: "", th: "" },
  },
  {
    id: "delivery",
    tab: { en: "Delivery robots", th: "หุ่นยนต์ส่งของ" },
    eyebrow: { en: "Pudu · Yunji · Pre-owned", th: "Pudu · Yunji · ผ่านการใช้งาน" },
    headline: { en: "Delivery robots.", th: "หุ่นยนต์ส่งของ" },
    accent: { en: "Dishes to the table, by themselves.", th: "เสิร์ฟถึงโต๊ะ ได้ด้วยตัวเอง" },
    // Thai: DRAFT for the Thai team
    sub: {
      en: "BellaBot, KettyBot, PuduBot and more for restaurants, hotels and offices — pre-owned, serviced and quoted to your site.",
      th: "BellaBot, KettyBot, PuduBot และรุ่นอื่น ๆ สำหรับร้านอาหาร โรงแรม และสำนักงาน เครื่องผ่านการใช้งาน ตรวจเช็กแล้ว เสนอราคาตามพื้นที่ของคุณ",
    },
    href: "/shop/delivery-robots",
    interest: "pudu-delivery",
    category: "delivery-robots",
    image: null,
    // the five delivery robots as a team, BellaBot in front (logo-free cut-outs)
    cutout: { src: "/studio/delivery-lineup.webp", width: 2151, height: 1064 },
    shot: { en: "", th: "" },
  },
  {
    id: "cooking",
    tab: { en: "Cooking robot", th: "หุ่นยนต์ทำอาหาร" },
    eyebrow: { en: "T-Chef · Brand-new or pre-owned", th: "T-Chef · เครื่องใหม่ หรือผ่านการใช้งาน" },
    headline: { en: "T-Chef TC-E10A.", th: "T-Chef TC-E10A" },
    accent: { en: "Stir-fry, cooked by itself.", th: "ผัดเสร็จเอง ไม่ต้องยืนเฝ้า" },
    // figures from T-Chef's product page (see supabase/fill-robot-pages.sql);
    // Thai: DRAFT for the Thai team
    sub: {
      en: "A compact intelligent cooking robot: 11 stir-fry modes, automatic food delivery, up to 1 kg a batch.",
      th: "หุ่นยนต์ทำอาหารอัจฉริยะขนาดเล็ก โหมดผัด 11 แบบ ส่งอาหารอัตโนมัติ ปรุงได้ครั้งละ 1 กก.",
    },
    href: "/products/t-chef-tc-e10a",
    interest: "cooking",
    productId: "t-chef-tc-e10a",
    image: null,
    cutout: { src: "/studio/t-chef-studio.webp", width: 1400, height: 1079 },
    shot: { en: "", th: "" },
  },
];

export const featuredFamilies: RobotFamily[] = [
  {
    id: "lawn",
    eyebrow: { en: "Mammotion LUBA", th: "Mammotion LUBA" },
    title: { en: "Robot lawn mowers", th: "หุ่นยนต์ตัดหญ้า" },
    tagline: {
      en: "Wire-free, all-wheel-drive mowers for Thai gardens and estates.",
      th: "หุ่นยนต์ตัดหญ้าไร้สาย ขับเคลื่อน 4 ล้อ สำหรับสวนและพื้นที่ในไทย",
    },
    href: "/shop/robot-mowers",
    interest: "lawn-mowing",
    // close-up with the robot in the upper half, so the copy goes below it
    image: "/posters/lubamini21500.png",
    focus: "50% 100%",
    copyAt: "bottom",
    shot: { en: "", th: "" },
  },
  {
    id: "phantas",
    eyebrow: { en: "Gausium · Brand-new or pre-owned", th: "Gausium · เครื่องใหม่ หรือผ่านการใช้งาน" },
    title: { en: "Phantas", th: "Phantas" },
    tagline: {
      en: "Autonomous floor cleaning for commercial spaces.",
      th: "หุ่นยนต์ทำความสะอาดพื้นอัตโนมัติ สำหรับพื้นที่เชิงพาณิชย์",
    },
    href: "/products/gausium-phantas",
    interest: "commercial-cleaning",
    productId: "gausium-phantas",
    // Same office render as the product page, widened a little further so
    // the robot sits smaller in this banner. The product page keeps office.webp.
    image: "/models/phantas/office-home.webp",
    focus: "50% 70%",
    shot: { en: "", th: "" },
  },
];

export const moreFamilies: RobotFamily[] = [
  {
    id: "pudu",
    eyebrow: { en: "Pudu · Yunji · Pre-owned", th: "Pudu · Yunji · ผ่านการใช้งาน" },
    title: { en: "Delivery robots", th: "หุ่นยนต์ขนส่ง" },
    tagline: {
      en: "BellaBot, KettyBot and more — for restaurants, hotels and offices.",
      th: "BellaBot, KettyBot และรุ่นอื่น ๆ สำหรับร้านอาหาร โรงแรม และสำนักงาน",
    },
    href: "/shop/delivery-robots",
    interest: "pudu-delivery",
    category: "delivery-robots",
    // The five delivery robots as a team, BellaBot in front, at their real
    // heights: one group cut-out (made from the logo-free product cut-outs) on
    // the light studio backdrop the card draws, as the T-Chef tile. No clean
    // lifestyle photo yet: the ones on file carry brochure text or a
    // customer's branding.
    image: null,
    cutout: { src: "/studio/delivery-lineup.webp", width: 2151, height: 1064 },
    shot: {
      en: "Bella or Ketty carrying dishes in a restaurant · 4:3 · robot centred, full height in frame",
      th: "Bella หรือ Ketty กำลังเสิร์ฟอาหารในร้าน · 4:3 · หุ่นยนต์อยู่กลางภาพ เห็นเต็มตัว",
    },
  },
  {
    id: "tchef",
    eyebrow: { en: "T-Chef · Brand-new or pre-owned", th: "T-Chef · เครื่องใหม่ หรือผ่านการใช้งาน" },
    title: { en: "Cooking robot", th: "หุ่นยนต์ทำอาหาร" },
    // descriptive only until the spec sheet says who it is for
    tagline: {
      en: "The T-Chef TC-E10A.",
      th: "T-Chef TC-E10A",
    },
    href: "/products/t-chef-tc-e10a",
    interest: "cooking",
    productId: "t-chef-tc-e10a",
    // The machine (cut out of the business's high-res render) on a light
    // studio backdrop drawn by the card. No lifestyle photo yet.
    image: null,
    cutout: { src: "/studio/t-chef-studio.webp", width: 1400, height: 1079 },
    shot: {
      en: "TC-E10A in a working kitchen, pan in motion · 4:3 · machine centred, full height in frame",
      th: "TC-E10A ในครัวที่กำลังทำงาน · 4:3 · เครื่องอยู่กลางภาพ เห็นเต็มตัว",
    },
  },
];
