/**
 * ABOUT PAGE CONTENT — DEFAULTS ONLY.
 *
 * The About page is edited in the CMS at /cms (About page), and the live copy
 * lives there. This file is the built-in default the CMS was first seeded
 * with (see data/siteContent.ts); editing it now changes nothing live.
 *
 * The notes below still apply to what anyone types in the CMS.
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
    // Keep in sync with the same figure on the home page (TrustSection.tsx).
    { value: "1,600+", label: { en: "Robots deployed", th: "หุ่นยนต์ที่ติดตั้งแล้ว" } },
    { value: "77", label: { en: "Provinces covered", th: "จังหวัดที่ให้บริการ" } },
    { value: "24h", label: { en: "Response time", th: "เวลาตอบกลับ" } },
  ] as AboutStat[],

  /* ----------------------------------------------------------------- story */
  story: {
    // The company's own copy (Sep 2026), supplied in both languages.
    body: {
      en: [
        "We believe great robotics should do more than showcase technology — it should make everyday life and work genuinely easier.",
        "The team behind findmyRobo brings years of hands-on experience in applying robotic technology across a wide range of applications, from cleaning and delivery robots to factory and automation solutions. Along the way, we have seen how the right technology can transform repetitive, time-consuming tasks into smarter and more efficient ways of working.",
        "That experience led us to another area where robotics can make a real difference — lawn and outdoor care.",
        "That is why we created findmyRobo: a brand focused on discovering and selecting robotic solutions that work in the real world, starting with robotic lawn mowers designed to make lawn maintenance simpler, more consistent, and less time-consuming.",
        "For us, it is not just about finding a robot. It is about finding the right solution for each space and each user, supported by practical advice, professional setup, and reliable after-sales service.",
        "findmyRobo — Find the right robot for the way you live.",
      ],
      th: [
        "เราเชื่อว่า หุ่นยนต์ที่ดีไม่ควรเป็นเพียงเทคโนโลยีที่น่าสนใจ แต่ต้องช่วยให้ชีวิตและการทำงานง่ายขึ้นได้จริง",
        "ทีมงานเบื้องหลัง findmyRobo มีประสบการณ์ในการนำเทคโนโลยีหุ่นยนต์ไปประยุกต์ใช้กับงานหลากหลายรูปแบบมาอย่างต่อเนื่อง ตั้งแต่ Cleaning Robot, Delivery Robot ไปจนถึง Factory & Automation Solutions ทำให้เราได้เห็นว่าหุ่นยนต์สามารถเปลี่ยนงานที่ต้องทำซ้ำ ใช้เวลา และพึ่งพาแรงงาน ให้กลายเป็นงานที่ง่ายและมีประสิทธิภาพมากขึ้นได้",
        "จากประสบการณ์นั้น เรามองเห็นอีกหนึ่งงานที่เทคโนโลยีสามารถเข้ามาช่วยได้อย่างชัดเจน — การดูแลสนามหญ้าและพื้นที่ Outdoor",
        "จึงเกิดเป็น findmyRobo แบรนด์ที่คัดสรรเทคโนโลยีหุ่นยนต์สำหรับการใช้งานจริง โดยเริ่มต้นจาก Robotic Lawn Mower ที่ช่วยให้การดูแลสนามเป็นเรื่องง่าย ประหยัดเวลา และลดภาระในการดูแลซ้ำ ๆ",
        "เราไม่ได้มองหาเพียง “หุ่นยนต์” แต่เรามองหาโซลูชันที่เหมาะกับพื้นที่และการใช้งานของแต่ละคน พร้อมการให้คำแนะนำ การติดตั้ง และการดูแลหลังการขาย เพื่อให้เทคโนโลยีสามารถใช้งานได้จริงในระยะยาว",
        "findmyRobo — Find the right robot for the way you live.",
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
    // "Authorised partner" is a claim about Mammotion — it needs Mammotion's
    // own written confirmation, a dealer agreement, or a listing on their
    // site before it can go back up. Until then this says only what RAAS PAL
    // can prove about its own supply chain, which needs nothing from them.
    // Swap back to a partnership claim the moment that confirmation exists.
    status: {
      en: "Genuine Mammotion Robots",
      th: "หุ่นยนต์ Mammotion แท้",
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
  // Empty on purpose: the section is hidden until there are real people to
  // name. It previously shipped three "REPLACE — full name" placeholders,
  // which published a fake leadership team.
  //
  // To bring it back, add entries here — the About page renders the section
  // automatically once the array is non-empty. The roles that were drafted:
  // Managing Director (กรรมการผู้จัดการ), Head of Sales (หัวหน้าฝ่ายขาย),
  // Service Manager (ผู้จัดการฝ่ายบริการ).
  //
  // Worth doing eventually: real names and faces matter at this price point —
  // an anonymous company asking for ฿300,000 is a harder sell.
  team: [] as TeamMember[],
};
