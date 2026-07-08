# Session History

## 2026-07-08 — CEO rebrand: light green + yellow + hero video slot
- CEO requested lighter premium look (green + yellow) and a hero video
  with animation fallback when no video is configured
- Renamed navy-* tokens → forest-* repo-wide (26 files) with new green
  values; gold kept, gold-600 darkened for text contrast
- Lightened navbar/hero/WhyUs/YouTube; kept footer/stat cards/specs
  panel as dark forest anchors; redrew mower + product SVGs in
  cream/forest/gold daylight style
- Added data/siteConfig.ts heroVideoUrl — video hero (dark overlay,
  white text) when set, animated lawn scene when null; both verified
- Build clean; screenshots at 1440/375 both locales

## 2026-07-04 — Session 2 (continued): multi-category + Thai i18n
- Restructured for multi-category: data/categories.ts is source of
  truth; nav "Shop ▾" dropdown generated from it (coming-soon
  categories show SOON badge); products tagged with category
- Added Thai language with next-intl v4: Thai default at "/",
  English at "/en", localeDetection off, EN/ไทย navbar switcher
- App moved to app/[locale]/ with middleware routing; all copy in
  messages/{th,en}.json (th.json drafted by Claude — pending native
  speaker review); Thai fonts Prompt + Noto Sans Thai as fallbacks
- Verified both locales with real-browser screenshots; build clean
- User deployed to Vercel, then step 2: built /shop, /shop/[category]
  (coming-soon empty states), /products/[id] (specs placeholder from
  public Mammotion data, features, related products) — 27 SSG pages;
  wired hero CTA, nav, and product cards to the new routes

## 2026-07-04 — Session 2 (Home Page Build)
- Studied robomate.com.au reference PDF (docs/) section by section
- Built the complete home page: AnnouncementBar (gold marquee),
  Navbar (sticky, blur, dropdowns, mobile drawer), HeroSection
  (animated SVG mower + cut trail + fireflies, word-by-word headline),
  ProductGrid (6 products, horizontal snap scroll, hover slide-up CTA),
  TrustSection (count-up stats), WhyUsSection (dark cards),
  PartnersSection, NewsSection, YouTubeCTA, Footer (payment
  placeholders only — no Omise code)
- Design system in globals.css @theme: navy/gold tokens; fonts
  Archivo + Inter + IBM Plex Mono via next/font
- Installed lucide-react; brand icons no longer ship with lucide,
  so socials/YouTube are inline SVGs (components/ui/BrandIcons.tsx)
- Accessibility: reduced-motion honored (MotionConfig + CSS media
  query), 44px touch targets, aria labels, focus-visible gold ring
- Verified: `npm run build` clean; screenshots at 1440px + 375px
  (headless Edge) — all sections and animations confirmed
- Next: product detail pages, real images, brand name decision

## 2026-06-30 — Session 1 (Planning Phase)
- Decided tech stack: Next.js + Omise + Sokochan (not Shopify)
- Compared Shopify vs custom build — custom wins on cost & design
- Compared Java backend vs Next.js — Next.js wins for this scale
- Discussed brand name options: Robotara, SiamBot, etc.
- Set up UI UX Pro Max skill + frontend-design skill
- Created second brain structure (this vault)
- Next: finalize domain, register Omise, contact Sokochan for API docs