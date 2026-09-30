# Session History

Newest first. Current state and open items live in `hot.md`.

## 2026-09-28 → 09-30 — Quote-only launch polish (committed straight to main)
- Quote-only flow: cart hidden (`cartEnabled: false`), every interested button
  opens one quote form; quotes email the sales team only (no customer email
  until prices are confirmed); optional note; demo picker lists only
  non-preorder robots
- Repo made public; PRD and Office lock files gitignored and purged from
  history; old branches deleted (only `main` remains)
- Hero: frosted quote side that stays narrow until the card is used and lines
  up with a 6° nav wedge; card centred in the frost; no frost below lg; quote
  card right under the hero buttons on phones; form scrolls into view on open
  (instant jump before the phone keyboard; the hero section is overflow-clip)
- Navbar: FindMyRobo TV removed; profile menu (sign in / create account /
  account / sign out + dark-mode switch) replaced Book a Demo and the theme
  button; gold track follows the pointer and marks the current section; Get a
  quote pill; menu icons
- Location page with the company's Google Maps listing; all Maps links point
  at the listing
- Dark mode now survives language switches (`ThemeScript`)
- Vercel: pushes to main auto-deploy; one deploy served a stale globals.css
  from the build cache — fixed with a cache-less redeploy

## 2026-09-18 → 09-24 — SEO, policies, pnpm, Payload CMS
- Per-page canonicals; Product, Organization and Breadcrumb structured data
- Return policy published (Thai Revised-2 + English)
- npm → pnpm; dropped the unverified "authorised partner" claim
- Payload CMS 3 embedded at `/cms` (replaced a hand-built content editor):
  homepage, announcement, About, contact/socials, SEO, media; own users
  (admin/marketing), drafts, versions, live preview; migrations run in build

## 2026-08-06 → 08-25 — Brand, accounts, launch prep
- Brand settled as FindMyRobo (after RoboStore TH / RoboMart TH)
- Office address in footer; password reset; profile self-service; order
  confirmation + sales alert emails; metadataBase, sitemap, robots
- About page with editable content; installation sold as one product with
  coverage picked on its page; "Awaiting quotation" order status; prices
  hidden in sales alerts
- Thai team's reviewed copy applied; real LINE QR; real social links; news
  section and unfinished footer links hidden

## 2026-07-09 → 07-31 — Commerce build-out
- Supabase auth (customer signup/login, role-based admin); products in
  Supabase with admin editing, uploads, visibility toggle, orders dashboard
- Service packages (demo, installation) and checkout upsells; multi-video hero
- Omise payments (card + PromptPay), Sokochan fulfilment (gated, manual send)
- Light/dark mode; Barlow typeface; product gallery, reviews, FAQ, showcase
  carousel, tech anatomy section; robot comparison with floating launcher
- Theme moved from green to black + gold (forest-* tokens remapped to
  charcoal); navbar split with the grey wedge; collapsible search
- Pool, cleaning and delivery categories marked coming soon

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