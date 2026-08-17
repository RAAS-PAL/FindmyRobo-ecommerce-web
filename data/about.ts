/**
 * ABOUT PAGE CONTENT — everything on /about lives here.
 *
 * ⚠️ EVERY VALUE BELOW IS A DRAFT. Each one is marked REPLACE. Nothing here is
 * a real fact about the company — it is scaffolding so you can see the shape of
 * the page and swap in the truth.
 *
 * Do not publish until every REPLACE is either corrected or the whole block is
 * deleted. Claims about awards, partner status, and numbers are the ones that
 * matter legally — an unverified "official distributor" line is a real problem,
 * not a typo.
 *
 * Section headings and button labels are NOT here — those are UI chrome and
 * live in messages/{en,th}.json under "about". This file is only the company's
 * own content, kept together so it can be edited in one pass.
 */

export interface Bilingual {
  en: string;
  th: string;
}

export interface AboutStat {
  /** Big number or short value, e.g. "500+", "2019", "77". Same in both locales. */
  value: string;
  label: Bilingual;
}

export interface AboutValue {
  /** lucide-react icon name rendered by the page — see ICONS in the page file. */
  icon: "shield" | "home" | "wrench" | "headset";
  title: Bilingual;
  body: Bilingual;
}

export interface TeamMember {
  name: string;
  role: Bilingual;
  /** Photo in /public, e.g. "/team/somchai.jpg". null shows an initial instead. */
  photo: string | null;
}

export interface Milestone {
  /** Year or "2024 Q3" — displayed as-is. */
  when: string;
  title: Bilingual;
  body: Bilingual;
}

export const about = {
  /* ------------------------------------------------------------------ hero */
  hero: {
    // Wording reviewed and approved by the Thai team (Aug 2026 copy pass).
    intro: {
      en: "We bring professional robotic lawn mowers to Thailand — with local supply, professional installation, reliable after-sales service, and warranty support you can count on.",
      th: "เรานำหุ่นยนต์ตัดหญ้าระดับมืออาชีพมาสู่ประเทศไทย พร้อมดูแลครบตั้งแต่การจัดจำหน่าย ติดตั้ง บริการหลังการขาย ไปจนถึงการรับประกันที่คุณมั่นใจได้",
    },
  },

  /* ----------------------------------------------------------------- stats */
  // REPLACE all four. Use numbers you can defend if a customer asks.
  // Delete any you cannot substantiate — three honest stats beat four vague ones.
  stats: [
    { value: "2021", label: { en: "Serving Thailand since", th: "ให้บริการในไทยตั้งแต่ปี" } },
    { value: "500+", label: { en: "Robots deployed", th: "หุ่นยนต์ที่ติดตั้งแล้ว" } },
    { value: "77", label: { en: "Provinces covered", th: "จังหวัดที่ให้บริการ" } },
    { value: "24h", label: { en: "Response time", th: "เวลาตอบกลับ" } },
  ] as AboutStat[],

  /* ----------------------------------------------------------------- story */
  story: {
    // REPLACE: the real reason the company started selling these robots.
    // Specific beats inspirational — "our founder spent every Sunday cutting
    // 3 rai by hand" lands; "we are passionate about innovation" does not.
    body: {
      en: [
        "Thai lawns are hard on machines. Heat, sudden rain, thick grass that grows back in days, and gardens that run up slopes and around trees rather than sitting flat.",
        "We started importing robotic mowers because the people buying them here had no one to call when something went wrong. Grey imports arrived with no Thai warranty, no local parts, and manuals in the wrong language.",
        "So we built the other half of the product: local stock, professional installation, Thai-speaking support, and a warranty honoured here rather than in another country.",
      ],
      th: [
        "สนามหญ้าเมืองไทยไม่ใช่เรื่องง่ายสำหรับเครื่องจักร ทั้งอากาศร้อน ฝนที่ตกกะทันหัน หญ้าที่ขึ้นเร็วภายในไม่กี่วัน และสวนที่มีทั้งทางลาดและต้นไม้ ไม่ได้ราบเรียบเสมอไป",
        "เราเริ่มนำเข้าหุ่นยนต์ตัดหญ้าเพราะเห็นว่าคนที่ซื้อในไทยไม่มีใครให้ติดต่อเมื่อเครื่องมีปัญหา สินค้านำเข้าแบบไม่เป็นทางการมาโดยไม่มีการรับประกันในไทย ไม่มีอะไหล่ในประเทศ และคู่มือเป็นภาษาที่อ่านไม่ออก",
        "เราจึงสร้างอีกครึ่งหนึ่งของสินค้าขึ้นมา ทั้งสต็อกในประเทศ การติดตั้งโดยทีมงานมืออาชีพ ทีมซัพพอร์ตที่พูดภาษาไทย และการรับประกันที่เคลมได้ในประเทศไทย ไม่ใช่ที่ต่างประเทศ",
      ],
    },
    // REPLACE: a real photo of the office, showroom, team, or an installation.
    // A genuine photo of a real place is the single strongest trust signal here.
    image: "/posters/onebangkok1.webp",
  },

  /* --------------------------------------------------------------- partner */
  // ⚠️ REPLACE OR DELETE THIS WHOLE BLOCK.
  // Only publish a partner/distributor claim the manufacturer would confirm in
  // writing. If the arrangement is informal, delete `partner` entirely — the
  // page renders fine without it.
  partner: {
    name: "Mammotion",
    // REPLACE with the exact wording you are entitled to use.
    status: {
      en: "Authorised partner in Thailand",
      th: "พาร์ทเนอร์อย่างเป็นทางการในประเทศไทย",
    },
    body: {
      en: "Every robot we sell is sourced through official channels, arrives with genuine parts, and is covered by a warranty we honour here in Thailand.",
      th: "หุ่นยนต์ทุกเครื่องที่เราจำหน่ายนำเข้าผ่านช่องทางอย่างเป็นทางการ มาพร้อมอะไหล่แท้ และอยู่ภายใต้การรับประกันที่เราดูแลให้ในประเทศไทย",
    },
    /** Logo in /public, or null to show the name as text. */
    logo: null as string | null,
  } as {
    name: string;
    status: Bilingual;
    body: Bilingual;
    logo: string | null;
  } | null,

  /* ---------------------------------------------------------------- values */
  // These four are the real argument for buying from you rather than importing.
  // Wording reviewed and approved by the Thai team (Aug 2026 copy pass) — they
  // deliberately shortened each body to one line, so keep new entries as tight.
  values: [
    {
      icon: "shield",
      title: { en: "Warranty in Thailand", th: "รับประกันในประเทศไทย" },
      body: {
        en: "Warranty claims and service are handled locally — no need to send the robot overseas.",
        th: "เคลมและรับบริการได้ในประเทศ ไม่ต้องส่งเครื่องไปต่างประเทศ",
      },
    },
    {
      icon: "home",
      title: { en: "Try Before You Decide", th: "ทดลองก่อนตัดสินใจ" },
      body: {
        en: "Test the robot in your own space before making a decision.",
        th: "ทดสอบการใช้งานจริงในพื้นที่ของคุณ",
      },
    },
    {
      icon: "wrench",
      title: { en: "Professional Installation", th: "ติดตั้งโดยทีมผู้เชี่ยวชาญ" },
      body: {
        en: "Site survey, installation, and setup — ready to use.",
        th: "สำรวจ ติดตั้ง และตั้งค่าให้พร้อมใช้งาน",
      },
    },
    {
      icon: "headset",
      title: { en: "After-Sales Service", th: "บริการหลังการขาย" },
      body: {
        en: "Local support team ready to advise and assist you throughout your ownership.",
        th: "ทีมซัพพอร์ตในประเทศ พร้อมให้คำแนะนำและดูแลต่อเนื่อง",
      },
    },
  ] as AboutValue[],

  /* ------------------------------------------------------------- milestones */
  // Wording reviewed and approved by the Thai team (Aug 2026 copy pass).
  // The 2024 entry is the one still to verify — confirm the year the coverage
  // actually widened before this goes out.
  milestones: [
    {
      when: "2021",
      // CONFIRMED: founding year is 2021.
      title: { en: "Company Founded", th: "ก่อตั้งบริษัท" },
      body: {
        en: "Started importing outdoor robotics for use in Thailand.",
        th: "เริ่มนำเข้าหุ่นยนต์สำหรับงานกลางแจ้ง เพื่อรองรับการใช้งานในประเทศไทย",
      },
    },
    {
      when: "2024",
      title: { en: "Service Network Expanded", th: "ขยายเครือข่ายบริการ" },
      body: {
        en: "Installation and after-sales service coverage expanded beyond Bangkok.",
        th: "เพิ่มพื้นที่ให้บริการด้านการติดตั้งและดูแลหลังการขาย ครอบคลุมมากกว่ากรุงเทพฯ",
      },
    },
    {
      when: "2026",
      title: { en: "FindMyRobo Launched", th: "เปิดตัว FindMyRobo" },
      body: {
        en: "FindMyRobo launched as an online platform that makes it easier to discover and choose the right robot.",
        th: "ช่องทางออนไลน์ที่ช่วยให้ค้นหาและเลือกหุ่นยนต์ได้ง่ายยิ่งขึ้น",
      },
    },
  ] as Milestone[],

  /* ------------------------------------------------------------------ team */
  // REPLACE with real people, or set to [] to hide the section.
  // Real names and faces matter a lot at this price point — an anonymous
  // company asking for ฿300,000 is a harder sell than three named people.
  team: [
    {
      name: "REPLACE — full name",
      role: { en: "Managing Director", th: "กรรมการผู้จัดการ" },
      photo: null,
    },
    {
      name: "REPLACE — full name",
      role: { en: "Head of Sales", th: "หัวหน้าฝ่ายขาย" },
      photo: null,
    },
    {
      name: "REPLACE — full name",
      role: { en: "Service Manager", th: "ผู้จัดการฝ่ายบริการ" },
      photo: null,
    },
  ] as TeamMember[],
};
