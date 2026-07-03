# Session History

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