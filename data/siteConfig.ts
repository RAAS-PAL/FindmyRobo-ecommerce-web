/**
 * Site-wide settings.
 *
 * heroVideoUrls — hero background videos, played one after another in a
 * loop (1, 2, 3, back to 1). While the list is empty, the hero shows the
 * animated lawn scene instead.
 *
 * heroVideoPoster is NO LONGER USED. The player cross-fades between preloaded
 * clips and never shows a poster — a poster used to flash on every clip switch.
 * Don't re-wire it into the <video> without solving that first.
 *
 * ADDING A NEW HERO VIDEO — the encoding matters more than the source:
 * a raw export will stall on mobile no matter how fast the host is. Run it
 * through ffmpeg first (keep the source file somewhere outside the repo):
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
 * — a sticky product image on the left that swaps as you scroll each feature.
 */
export interface ShowcaseFeature {
  /** Image shown in the sticky panel (URL or /public path). */
  image: string;
  heading: { en: string; th: string };
  body: { en: string; th: string };
}

/**
 * Platforms the footer knows how to render an icon for. A key here does not
 * mean an account exists — see siteConfig.socials for the ones that do.
 */
export type SocialPlatform = "facebook" | "youtube" | "tiktok";

export const siteConfig = {
  /**
   * Customer-facing price visibility.
   *
   * false = quotation mode: no price is rendered anywhere a customer can see.
   * Prices are still read from the catalogue, still priced server-side at
   * checkout, and still shown to sales in the alert email and the admin panel —
   * they are the starting point for the quotation, not a published offer.
   *
   * Set back to true when card payment goes live and the site sells directly.
   */
  showPrices: false,

  heroVideoUrls: [
    // Hero background clips, played in order then looped. Hosted on Cloudinary
    // and served through its CDN with q_auto (auto-compress to the best
    // quality-per-byte) + ac_none (drop the audio track — the hero is muted).
    // So they stay high quality, load fast, and don't use Vercel bandwidth.
    // Swap these URLs (keeping the q_auto/ac_none prefix) to change the hero.
    "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/ac_none/v1785773065/0803_1_bkaoz9.mp4",
    "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/ac_none/v1785770343/0803_rgjdz9.mp4",
  ] as string[],
  heroVideoPoster: "/videos/hero-poster.jpg" as string | null,

  /**
   * Home feature showcase between the product cards and the video gallery: a
   * sticky image on the left that swaps as you scroll each feature on the right
   * (components/sections/FeatureShowcase.tsx). Give each entry its OWN image so
   * the swap is visible. Images below are PLACEHOLDERS — replace with real
   * feature/cutaway shots. Empty array hides the section.
   */
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
  ] as ShowcaseFeature[],

  /**
   * Home video gallery ("See It in Action"), shown between the product cards
   * and the "Who We Are" story (components/sections/VideoShowcase.tsx). Each
   * card shows its poster + a play button and only loads a stripped-down embed
   * on click (no YouTube chrome until played). Set a custom `poster` on every
   * card for the cleanest, non-YouTube look. Empty shows a placeholder.
   */
  videoGallery: [
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785810911/0804_le3wbx.mp4", // your Short link
      poster: "/posters/lubaback1.png",           // optional custom image
      title: "Enjoy Every Moment",
      author: "",                         // optional
      tag: "LUBA 3 AWD",                                  // optional
    },
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/q_auto/v1785491668/0731_5_yzbrty.mp4", // your Short link
      poster: "/posters/onebangkok1.webp",           // optional custom image
      title: "Obstacle Avoidance Footage",
      author: "",                         // optional
      tag: "LUBA mini 2 AWD 1500",                                  // optional
    },
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785812434/0804_1_f4vev2.mp4", // your Short link
      poster: "/posters/luba32.png",           // optional custom image
      title: "Obstacle Avoidance Footage",
      author: "",                         // optional
      tag: "LUBA 3 AWD",                                  // optional
    },
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785811377/20260714_123412_zn9qe3.mp4", // your Short link
      poster: "/posters/lubamini21500.png",           // optional custom image
      title: "One Bangkok",
      author: "",                         // optional
      tag: "LUBA mini 2 AWD 1500",                                  // optional
    },
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1786096962/0731_7_atlvly.mp4", // your Short link
      poster: "/posters/lubamini21500onebangkok.png",           // optional custom image
      title: "One Bangkok",
      author: "",                         // optional
      tag: "LUBA mini 2 AWD 1500",                                  // optional
    }
  ] as GalleryVideo[],

  /**
   * Sales team contacts, shown on /contact-sales (PRD req 13 + 19).
   * lineQrImage — the LINE official-account QR in /public; a "coming soon"
   * frame shows while it is null.
   */
  salesContact: {
    phone: "02-576-5555",
    email: "sales@raaspal.com",
    lineId: "@raaspal",
    lineQrImage: "/contact/contact_lineQR.png" as string | null,
    /**
     * The add-friend link the QR above encodes, so the card is tappable on
     * phones (nobody can scan a QR shown on the screen they are holding).
     * If the QR is ever regenerated, re-read it and update this to match —
     * a link pointing at a different account than the QR is worse than none.
     */
    lineUrl: "https://lin.ee/kDaB03I",
    /**
     * Registered office. Rendered on /contact-sales and in the footer.
     * This is not decoration: a visible business address is what Omise's
     * merchant review looks for, and PDPA requires the data controller to be
     * reachable. Keep it in sync with the company registration document.
     */
    addressLines: [
      "99/40 Software Park Building Moo 4,",
      "Chaengwattana rd., Khlong Kluea, Pak Kret, Nonthaburi Thailand 11120",
    ],
    /**
     * The same address, split into the fields schema.org's PostalAddress
     * wants — Google reads structure, not prose. This is the source for the
     * Organization structured data (lib/structuredData.ts). If the office
     * moves, change BOTH this and addressLines above; they are one address
     * written two ways.
     */
    postalAddress: {
      streetAddress: "99/40 Software Park Building Moo 4, Chaengwattana Rd., Khlong Kluea",
      addressLocality: "Pak Kret",
      addressRegion: "Nonthaburi",
      postalCode: "11120",
      addressCountry: "TH",
    },
  },

  /**
   * The company behind the site, for the Organization structured data and the
   * legal disclosures. Trading name and legal entity differ on purpose: Google
   * shows `name` in the brand panel; `legalName` is what appears on the DBD
   * certificate (source: docs/legal-pages-information.xlsx, rows 1–2).
   */
  organization: {
    name: "FindMyRobo",
    legalName: "Raas Pal Company Limited",
    legalNameTh: "ราส พอล จำกัด",
    /** Logo for search results — the light-background variant, on white. */
    logo: "/main-logo-light.png",
  },

  /**
   * Public social profiles. Only platforms listed here are rendered — the
   * footer used to show five icons that all pointed at "#", which reads as a
   * broken site rather than as a company without a TikTok. Add a key when the
   * account actually exists; remove it if the account goes away.
   */
  socials: {
    facebook: "https://www.facebook.com/findmyrobo",
    youtube: "https://www.youtube.com/@FindmyRobo",
    // TikTok account is coming — paste the profile URL here and the icon
    // appears in the footer on its own. Left commented rather than set to an
    // empty string so it stays a no-op until there is a real link.
    // tiktok: "https://www.tiktok.com/@...",
  } as Partial<Record<SocialPlatform, string>>,
};

/** Google Maps link built from the office address, so there is one source of truth. */
export const salesMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.salesContact.addressLines.join(" ")
)}`;
