import type { Bilingual } from "@/data/siteContent";
import type { QuoteInterest } from "@/lib/quoteRequest";

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

/**
 * Where a hero slide's studio photo may sit. The hero runs up under the
 * navbar, so the box starts below the bar (69px) and ends above the headline.
 * desktop.left: the box starts on the hero title's line, i.e. the
 * page's content column (max-w-7xl, centred) plus its lg:px-8 padding — keep
 * in step with the copy block in HeroSection. desktop.bottom: the headline
 * block is about 23rem tall on any screen.
 */
const HERO_PHOTO_BOX: Pick<StudioPhoto, "phone" | "desktop"> = {
  phone: { top: "69px", right: "0%", bottom: "0%", left: "0%" },
  desktop: {
    // a clear band under the navbar, so the robot doesn't crowd it
    top: "calc(69px + 7%)",
    // stop short of the quote card's column (20rem card + 2.5rem air), so the
    // robot is centred in the space between the title's edge and the card
    right: "calc(max(0px, (100% - 80rem) / 2) + 2rem + 22.5rem)",
    bottom: "max(38%, 24rem)",
    left: "calc(max(0px, (100% - 80rem) / 2) + 2rem)",
  },
};

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
   * Draw the photo smaller than the tile (1 fills it). The gap shows
   * `photoBackdrop`, which should match the photo's own studio colour.
   */
  photoScale?: number;
  photoBackdrop?: string;
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
  /** A single model's slide or banner: names it in the quote (data/lineup.ts). */
  modelId?: string;
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
  /** A single model's slide or banner: names it in the quote (data/lineup.ts). */
  modelId?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    id: "lawn",
    tab: { en: "Lawn mowing", th: "หุ่นยนต์ตัดหญ้า" },
    eyebrow: { en: "Mammotion · Robot lawn mowers", th: "Mammotion · หุ่นยนต์ตัดหญ้า" },
    headline: null,
    accent: null,
    sub: null,
    href: "/shop/robot-mowers",
    interest: "lawn-mowing",
    // Studio set, not a lawn photo: green grass fought the blue palette, and
    // cut-outs pasted into garden scenes look composited. One robot, above
    // the headline and clear of the quote card. Not mirrored to face into
    // the page: that would print MAMMOTION / LUBA backwards.
    image: null,
    // studio render of the LUBA 3 AWD (generated from the product photo,
    // details checked against it)
    studioPhoto: {
      src: "/studio/luba-studio-photo.webp",
      alt: "Mammotion LUBA robot mower",
      width: 1672,
      height: 941,
      ...HERO_PHOTO_BOX,
    },
    studioLight: "neutral",
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
    modelId: "gausium-phantas",
    image: null,
    // Gausium's transparent product render (2026-09-30); its own soft floor
    // glow reads as a spotlight on the dark set
    studioPhoto: {
      src: "/studio/phantas-studio.webp",
      alt: "Gausium Phantas cleaning robot",
      width: 1400,
      height: 1173,
      fade: false,
      ...HERO_PHOTO_BOX,
    },
    studioLight: "neutral",
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
    modelId: "gausium-phantas",
    // Gausium's own render: the robot sits low, under the title's scrim
    image: "/models/phantas/office.webp",
    focus: "50% 70%",
    shot: { en: "", th: "" },
  },
];

export const moreFamilies: RobotFamily[] = [
  {
    id: "pudu",
    eyebrow: { en: "Pudu Robotics · Pre-owned", th: "Pudu Robotics · ผ่านการใช้งาน" },
    title: { en: "Delivery robots", th: "หุ่นยนต์ขนส่ง" },
    tagline: {
      en: "Bella, Ketty and more — for restaurants, hotels and offices.",
      th: "Bella, Ketty และรุ่นอื่น ๆ สำหรับร้านอาหาร โรงแรม และสำนักงาน",
    },
    href: "/shop/delivery-robots",
    interest: "pudu-delivery",
    image: null,
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
    modelId: "t-chef-tc-e10a",
    // The machine (the business's high-res render) on a light studio set,
    // made for this tile: it sits in the lower part, clear of the title and
    // buttons. Phones show a 4:3 strip, kept to the bottom. No lifestyle
    // photo yet.
    image: "/models/t-chef/tile.webp",
    focus: "50% 50%",
    focusPhone: "50% 100%",
    // a little smaller than the tile, so the machine isn't edge to edge
    photoScale: 0.9,
    photoBackdrop: "#d9dee6",
    shot: {
      en: "TC-E10A in a working kitchen, pan in motion · 4:3 · machine centred, full height in frame",
      th: "TC-E10A ในครัวที่กำลังทำงาน · 4:3 · เครื่องอยู่กลางภาพ เห็นเต็มตัว",
    },
  },
];
