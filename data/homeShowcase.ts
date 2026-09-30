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

export interface ShowcasePhoto {
  image: string | null;
  /**
   * Instead of a photo: product cut-outs on a graphite studio set
   * (components/ui/StudioStage). Wins over `image`.
   */
  studio?: StudioRobot[];
  /** The studio's key light: soft white, or the brand blue. Default blue. */
  studioLight?: "neutral" | "accent";
  focus?: string;
  /** Below sm, when the phone crop needs a different point (defaults to focus). */
  focusPhone?: string;
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
    studio: [
      {
        src: "/studio/luba-orange.webp",
        alt: "Mammotion LUBA robot mower",
        width: 1846,
        height: 958,
        phone: { left: "12%", bottom: "16%", width: "76%" },
        desktop: { left: "21%", bottom: "56%", width: "27%" },
      },
    ],
    studioLight: "neutral",
    shot: { en: "", th: "" },
  },
  {
    id: "phantas",
    tab: { en: "Commercial cleaning", th: "ทำความสะอาดเชิงพาณิชย์" },
    eyebrow: { en: "Gausium · Commercial cleaning robot", th: "Gausium · หุ่นยนต์ทำความสะอาดเชิงพาณิชย์" },
    headline: { en: "Gausium Phantas.", th: "Gausium Phantas" },
    accent: { en: "Clean floors, every shift.", th: "พื้นสะอาด ทุกกะการทำงาน" },
    sub: {
      en: "Autonomous floor cleaning for offices, hotels and shops. Tell us about your site and we’ll quote the right setup.",
      th: "หุ่นยนต์ทำความสะอาดพื้นอัตโนมัติ สำหรับสำนักงาน โรงแรม และร้านค้า บอกเราเกี่ยวกับพื้นที่ของคุณ แล้วเราจะเสนอราคาที่เหมาะสม",
    },
    href: "/shop/cleaning-robots",
    interest: "commercial-cleaning",
    image: null,
    shot: {
      en: "Phantas cleaning a bright lobby or office corridor · landscape 16:9 · robot in the centre third, open floor below it",
      th: "Phantas กำลังทำความสะอาดล็อบบี้หรือทางเดินสำนักงาน · แนวนอน 16:9 · หุ่นยนต์อยู่กลางภาพ",
    },
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
    eyebrow: { en: "Gausium", th: "Gausium" },
    title: { en: "Phantas", th: "Phantas" },
    tagline: {
      en: "Autonomous floor cleaning for commercial spaces.",
      th: "หุ่นยนต์ทำความสะอาดพื้นอัตโนมัติ สำหรับพื้นที่เชิงพาณิชย์",
    },
    href: "/shop/cleaning-robots",
    interest: "commercial-cleaning",
    image: null,
    shot: {
      en: "Phantas at work in a mall, hotel or office · wide 21:9 · robot small in the lower half, space above for the title",
      th: "Phantas ทำงานในห้าง โรงแรม หรือสำนักงาน · ภาพกว้าง 21:9 · หุ่นยนต์อยู่ครึ่งล่าง เว้นที่ด้านบนสำหรับหัวข้อ",
    },
  },
];

export const moreFamilies: RobotFamily[] = [
  {
    id: "pudu",
    eyebrow: { en: "Pudu Robotics", th: "Pudu Robotics" },
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
    eyebrow: { en: "T-Chef", th: "T-Chef" },
    title: { en: "Cooking robot", th: "หุ่นยนต์ทำอาหาร" },
    tagline: {
      en: "The TC-E10A, for commercial kitchens.",
      th: "TC-E10A สำหรับครัวเชิงพาณิชย์",
    },
    href: null,
    interest: "cooking",
    image: null,
    shot: {
      en: "TC-E10A in a working kitchen, pan in motion · 4:3 · machine centred, full height in frame",
      th: "TC-E10A ในครัวที่กำลังทำงาน · 4:3 · เครื่องอยู่กลางภาพ เห็นเต็มตัว",
    },
  },
];
