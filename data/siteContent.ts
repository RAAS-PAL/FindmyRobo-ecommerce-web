import { about, type AboutStat, type AboutValue, type Bilingual, type Milestone, type TeamMember } from "@/data/about";
import { siteConfig } from "@/data/siteConfig";
import type { Locale } from "@/data/products";

/**
 * EDITABLE SITE CONTENT — the shapes the storefront renders, and their defaults.
 *
 * The live content is edited in the Payload CMS at /cms (payload.config.ts) and
 * mapped to these types by lib/payloadContent.ts. Publishing there updates the
 * site without a deploy.
 *
 * The values in THIS file are the built-in defaults. They are what the site
 * shows when the CMS is not configured (no DATABASE_URL), and what the CMS was
 * seeded with on its first deploy (payload/seed.ts). After that, editing them
 * here changes nothing on the live site — change the content in /cms.
 *
 * Types live here rather than in lib/ because client components need them and
 * must not import the server-only store (lib/siteContentStore.ts).
 */

export type { Bilingual };

/** The sections the Content editor has, in tab order. */
export const CONTENT_SECTIONS = ["home", "announcement", "about", "contact", "seo"] as const;
export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export const isContentSection = (value: string): value is ContentSection =>
  (CONTENT_SECTIONS as readonly string[]).includes(value);

/**
 * The text for one locale, falling back to English and then Thai. Items in a
 * list may have only one language filled in; the other falls back rather than
 * rendering an empty heading.
 */
export const pick = (text: Bilingual, locale: Locale | string): string =>
  (locale === "th" ? text.th : text.en) || text.en || text.th;

/* ------------------------------------------------------------------ types */

/** One card in the home video gallery (components/sections/VideoShowcase.tsx). */
export interface GalleryVideo {
  /** YouTube (Short) link, or an mp4 URL/path. */
  url: string;
  /** Custom thumbnail (URL or /public path). Falls back to the YouTube
   *  thumbnail; set this for a clean, non-YouTube look. */
  poster?: string;
  title: string;
  /** Small credit line, e.g. the creator's handle. */
  author?: string;
  /** Small pill label, e.g. the product shown. */
  tag?: string;
}

/**
 * One row in the home feature showcase (components/sections/FeatureShowcase.tsx)
 * — a sticky product image that swaps as you scroll each feature.
 */
export interface ShowcaseFeature {
  /** Image shown in the sticky panel (URL or /public path). */
  image: string;
  heading: Bilingual;
  body: Bilingual;
}

/** One stat card in the home "Who We Are" section — counts up on scroll. */
export interface HomeStat {
  value: number;
  /** Digits after the decimal point: 0 for "1,600", 1 for "4.7". */
  decimals: number;
  /** Shown after the number, e.g. "+" or "★". */
  suffix: string;
  label: Bilingual;
}

/**
 * Platforms the footer knows how to render an icon for. A key here does not
 * mean an account exists — an empty URL renders no icon.
 */
export const SOCIAL_PLATFORMS = ["facebook", "youtube", "tiktok"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface AnnouncementContent {
  /** Off hides the gold bar above the navbar entirely. */
  enabled: boolean;
  messages: Bilingual[];
}

export interface HomeContent {
  heroHeadline: Bilingual;
  /** Second headline line, in gold. */
  heroAccent: Bilingual;
  heroSub: Bilingual;
  /**
   * Hero background clips, played in order then looped. Empty shows the
   * animated lawn scene instead.
   *
   * ENCODING MATTERS MORE THAN THE HOST — a raw phone export stalls on mobile.
   * Upload to Cloudinary and paste the URL with `q_auto/ac_none/` after
   * `/upload/` (auto-compress, strip audio). For a self-hosted file, run it
   * through ffmpeg first:
   *
   *   ffmpeg -ss 0 -i source.mp4 -t 12 -vf "scale=1920:-2" -r 30 \
   *     -c:v libx264 -profile:v main -pix_fmt yuv420p \
   *     -crf 27 -maxrate 2000k -bufsize 4000k \
   *     -movflags +faststart -an public/videos/hero-N.mp4
   *
   *   -movflags +faststart : index at the FRONT, so playback starts before the
   *                          file finishes downloading. Without it iOS Safari
   *                          refuses to autoplay and shows a play button.
   *   -pix_fmt yuv420p     : Safari will not decode 4:2:2/4:4:4 at all.
   *   -an                  : drop audio — the hero is muted anyway.
   *   ~12s, ~2 Mbps        : keep each file 2-3 MB. Bandwidth is billed.
   */
  heroVideos: string[];
  /** Empty hides the section. */
  featureShowcase: ShowcaseFeature[];
  /** Empty shows a "videos coming soon" placeholder. */
  videoGallery: GalleryVideo[];
  trustHeading: Bilingual;
  trustBody: Bilingual;
  trustStats: HomeStat[];
}

export interface ContactContent {
  phone: string;
  /** Opening hours under the phone number on /contact-sales. */
  phoneHours: Bilingual;
  /** Public contact address. New-order alerts go to SALES_ALERT_EMAIL, not here. */
  email: string;
  lineId: string;
  /**
   * The add-friend link the QR encodes, so the card is tappable on phones
   * (nobody can scan a QR shown on the screen they are holding). If the QR is
   * regenerated, update this to match — a link to a different account than
   * the QR is worse than none.
   */
  lineUrl: string;
  /** Empty shows a "QR coming soon" frame. */
  lineQrImage: string;
  /** Empty = no account on that platform, and no icon in the footer. */
  socials: Record<SocialPlatform, string>;
}

export interface AboutContent {
  intro: Bilingual;
  stats: AboutStat[];
  /** One entry per paragraph. */
  storyBody: { en: string[]; th: string[] };
  storyImage: string;
  /** Off hides the partner block. */
  partnerEnabled: boolean;
  partnerEyebrow: Bilingual;
  partnerName: string;
  partnerStatus: Bilingual;
  partnerBody: Bilingual;
  /** Empty shows the name as text only. */
  partnerLogo: string;
  values: AboutValue[];
  milestones: Milestone[];
  /** Empty hides the team section. */
  team: TeamMember[];
}

/** Per-product search overrides. An empty string means "automatic". */
export interface SeoOverride {
  title: Bilingual;
  description: Bilingual;
}

export interface SeoContent {
  /** The homepage title, and the fallback for any page without its own. */
  siteTitle: Bilingual;
  siteDescription: Bilingual;
  /** Image shown when a page without its own photo is shared on LINE/Facebook. */
  shareImage: string;
  /** Keyed by product id. Products not listed use the automatic values. */
  products: Record<string, SeoOverride>;
}

export interface SiteContent {
  home: HomeContent;
  announcement: AnnouncementContent;
  about: AboutContent;
  contact: ContactContent;
  seo: SeoContent;
}

/** What client components receive through SiteContentProvider. */
export type PublicSiteContent = Pick<SiteContent, "home" | "contact" | "announcement">;

/* --------------------------------------------------------------- defaults */

export const DEFAULT_CONTENT: SiteContent = {
  announcement: {
    enabled: true,
    messages: [
      { en: "🤖 LUBA 3 AWD Now Available in Thailand!", th: "🤖 LUBA 3 AWD มาถึงประเทศไทยแล้ว!" },
      {
        en: "Book your on-site demo now in Thailand",
        th: "จองเดโมถึงสถานที่ของคุณในประเทศไทย ได้แล้ววันนี้",
      },
    ],
  },

  home: {
    heroHeadline: { en: "Let the Robot Mow.", th: "ให้หุ่นยนต์ดูแลสนามแทนคุณ" },
    heroAccent: { en: "You Stay in the Shade.", th: "สวยง่ายทุกวัน" },
    heroSub: {
      en: "The best mowing robots you can find in Thailand — operating independently, with no need for constant human supervision.",
      th: "ยกระดับการดูแลสนามด้วยหุ่นยนต์ตัดหญ้าอัจฉริยะ ทำงานอัตโนมัติอย่างมั่นใจ โดยไม่ต้องคอยดูแลตลอดเวลา",
    },
    // Hosted on Cloudinary with q_auto (best quality-per-byte) + ac_none
    // (no audio track), so they load fast and don't use Vercel bandwidth.
    heroVideos: [
      "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/ac_none/v1785773065/0803_1_bkaoz9.mp4",
      "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/ac_none/v1785770343/0803_rgjdz9.mp4",
    ],
    // Images are PLACEHOLDERS — replace with real feature/cutaway shots.
    featureShowcase: [
      {
        image: "/posters/feature-awd.webp",
        heading: { en: "All-Wheel-Drive Traction", th: "ระบบขับเคลื่อนสี่ล้อ AWD" },
        body: {
          en: "Powerful AWD grips slopes and wet, uneven ground for a consistent cut across the most demanding Thai lawns.",
          th: "ระบบ AWD ทรงพลังยึดเกาะทางลาดชันและพื้นเปียกหรือขรุขระ ตัดหญ้าได้สม่ำเสมอแม้ในสนามที่ท้าทายที่สุดในเมืองไทย",
        },
      },
      {
        image: "/posters/feature-navigation.webp",
        heading: { en: "Wire-Free Smart Navigation", th: "นำทางอัจฉริยะไร้สาย" },
        body: {
          en: "Vision and RTK positioning map your lawn precisely — no perimeter wire to bury, no guesswork.",
          th: "ระบบวิชันและ RTK ทำแผนที่สนามอย่างแม่นยำ ไม่ต้องฝังสายรอบสนาม ไม่ต้องเดา",
        },
      },
      {
        image: "/posters/feature-ai.webp",
        heading: { en: "On-Device AI", th: "AI ในตัวเครื่อง" },
        body: {
          en: "Fast on-board AI recognises obstacles and plans efficient mowing paths in real time.",
          th: "AI ในตัวประมวลผลรวดเร็ว รู้จำสิ่งกีดขวางและวางเส้นทางตัดหญ้าอย่างมีประสิทธิภาพแบบเรียลไทม์",
        },
      },
    ],
    videoGallery: [
      {
        url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785810911/0804_le3wbx.mp4",
        poster: "/posters/lubaback1.png",
        title: "Enjoy Every Moment",
        tag: "LUBA 3 AWD",
      },
      {
        url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/v1785491668/0731_5_yzbrty.mp4",
        poster: "/posters/onebangkok1.webp",
        title: "Obstacle Avoidance Footage",
        tag: "LUBA mini 2 AWD 1500",
      },
      {
        url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785812434/0804_1_f4vev2.mp4",
        poster: "/posters/luba32.png",
        title: "Obstacle Avoidance Footage",
        tag: "LUBA 3 AWD",
      },
      {
        url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785811377/20260714_123412_zn9qe3.mp4",
        poster: "/posters/lubamini21500.png",
        title: "One Bangkok",
        tag: "LUBA mini 2 AWD 1500",
      },
      {
        url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1786096962/0731_7_atlvly.mp4",
        poster: "/posters/lubamini21500onebangkok.png",
        title: "One Bangkok",
        tag: "LUBA mini 2 AWD 1500",
      },
    ],
    trustHeading: {
      en: "Thai Robot Experts That Care Like a True Friend",
      th: "ผู้เชี่ยวชาญด้านหุ่นยนต์ในประเทศไทย พร้อมดูแลธุรกิจคุณในทุกขั้นตอน",
    },
    trustBody: {
      en: "Since 2021, we have been providing robotic solutions for businesses and organizations, backed by a team of experts who support you from consultation and installation to after-sales service—ensuring reliable and efficient operations.",
      th: "ตั้งแต่ปี 2021 เรามุ่งมั่นนำเสนอโซลูชันหุ่นยนต์สำหรับธุรกิจและองค์กร พร้อมทีมผู้เชี่ยวชาญที่ดูแลตั้งแต่ให้คำปรึกษา ติดตั้ง ไปจนถึงบริการหลังการขาย เพื่อให้ทุกการใช้งานมีประสิทธิภาพและมั่นใจยิ่งขึ้นครับ",
    },
    // "Robots deployed" is also an About page stat — keep the two in step.
    trustStats: [
      { value: 1600, decimals: 0, suffix: "+", label: { en: "Robots Deployed", th: "หุ่นยนต์ที่ติดตั้งแล้ว" } },
      { value: 4.7, decimals: 1, suffix: "★", label: { en: "Customer Rating", th: "คะแนนจากลูกค้า" } },
      { value: 40, decimals: 0, suffix: "+", label: { en: "Service Locations", th: "จุดให้บริการ" } },
    ],
  },

  about: {
    intro: about.hero.intro,
    stats: about.stats,
    storyBody: about.story.body,
    storyImage: about.story.image,
    partnerEnabled: about.partner !== null,
    partnerEyebrow: { en: "Official supply", th: "การจัดหาอย่างเป็นทางการ" },
    partnerName: about.partner?.name ?? "",
    partnerStatus: about.partner?.status ?? { en: "", th: "" },
    partnerBody: about.partner?.body ?? { en: "", th: "" },
    partnerLogo: about.partner?.logo ?? "",
    values: about.values,
    milestones: about.milestones,
    team: about.team,
  },

  contact: {
    phone: "02-576-5555",
    phoneHours: { en: "Mon–Sat, 9:00–18:00", th: "จันทร์–เสาร์ 9:00–18:00 น." },
    email: siteConfig.salesContact.email,
    lineId: "@raaspal",
    lineUrl: "https://lin.ee/kDaB03I",
    lineQrImage: "/contact/contact_lineQR.png",
    socials: {
      facebook: "https://www.facebook.com/findmyrobo",
      youtube: "https://www.youtube.com/@FindmyRobo",
      tiktok: "",
    },
  },

  seo: {
    siteTitle: {
      en: "FindMyRobo — The Ultimate Robotic Lawn Mowers for Thai Gardens",
      th: "FindMyRobo — หุ่นยนต์ตัดหญ้าที่เหนือระดับ เพื่อสวนไทย",
    },
    siteDescription: {
      en: "Premium robot lawn mowers for Thai gardens — wire-free, all-weather cutting that handles slopes and the rainy season. In-home demos in Bangkok with local Thai support.",
      th: "หุ่นยนต์ตัดหญ้าระดับพรีเมียมสำหรับสวนไทย ตัดหญ้าไร้สายทุกสภาพอากาศ รับมือทางลาดชันและหน้าฝนได้ดี พร้อมเดโมถึงบ้านในกรุงเทพฯ และทีมซัพพอร์ตคนไทย",
    },
    shareImage: "/main-logo-dark.png",
    products: {},
  },
};
