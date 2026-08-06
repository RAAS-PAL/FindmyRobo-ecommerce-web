# Hot Cache — Last Updated: 2026-07-08

## Latest Change — CEO REBRAND: LIGHT GREEN + YELLOW ✅ (2026-07-08)
- CEO decision: lighter look, green + yellow, premium. Supersedes navy+gold.
- Token rename repo-wide: navy-* → forest-* (green values) in
  app/globals.css @theme; gold kept (#F5C842); gold-600 darkened to
  #8a6a00 for WCAG text contrast on white; cloud/ink-muted now green-tinted
- Light surfaces: navbar (white glass), hero (daylight lawn scene:
  sun, pollen, cream/green mower), WhyUs (white cards), YouTube CTA
  (light gradient). Dark-forest anchors kept: footer, stat cards,
  specs panel, news banners, cart drawer, admin header
- HERO VIDEO SLOT: data/siteConfig.ts → heroVideoUrl (null now).
  Set to "/hero.mp4" (file in /public) or CDN URL → hero plays video
  full-bleed with dark overlay + white text; null → animated scene.
  Verified both modes render. CEO's video pending.
- RobotIllustration + hero MowerSvg restyled: cream shells, forest
  chassis, gold accents
- NBSP gotcha in HeroSection headline separator still applies (line
  contains a literal U+00A0 — edits there must match it)

## Latest Change (part 3) — SHOP + PRODUCT DETAIL PAGES ✅
- New routes (all SSG, 27 static pages, both locales):
  /shop (all products, category filter pills)
  /shop/[category] (4 categories; coming-soon ones get a
  premium empty state with Book-a-Demo CTA)
  /products/[id] (breadcrumb, navy gallery card, description,
  price, demo/contact CTAs, features list, dark specs panel,
  related products)
- data/products.ts: added specs field — PLACEHOLDER values from
  public Mammotion specs, replace when Chris/Pommy confirm
- All detail copy (descriptions, features, spec labels) in
  messages/{th,en}.json under productDetail + shop namespaces
- categories.ts: href field removed → use categoryHref(slug)
- ProductCard now links whole card to /products/[id]
- Hero "Find Your Ideal Robot" + nav Shop → /shop
- User has DEPLOYED to Vercel (before this change) — needs a
  redeploy/push to pick these pages up
- NEXT AGREED STEP: Book-a-Demo/contact flow (form + LINE OA
  button) — the site's conversion path until payments exist
- WINDOWS GOTCHA: TaskStop on `npm run start` leaves an orphaned
  node child holding port 3000 serving STALE routes — always
  kill by port before restarting (Get-NetTCPConnection -LocalPort 3000)

## Latest Change (same day, part 2) — THAI LANGUAGE ✅
- Full bilingual site via next-intl v4: THAI DEFAULT at "/",
  English at "/en" (user's explicit choice)
- localeDetection: false — "/" is always Thai regardless of
  browser language; EN/ไทย switcher in navbar (desktop + drawer)
- All copy in messages/th.json + messages/en.json (Claude-drafted
  Thai — needs native review before launch)
- App moved to app/[locale]/; middleware.ts handles routing;
  both locales prerender as static (SSG)
- Thai fonts: Prompt (display fallback) + Noto Sans Thai (body
  fallback) — Archivo/Inter have no Thai glyphs
- Product taglines + category names/descriptions now live in
  messages files, NOT in data/*.ts (data has ids/prices/slugs only)
- GOTCHA: HeroSection.tsx line ~138 contains a real NBSP (U+00A0)
  inside "&& " "" — intentional (spaces collapse at end of
  inline-block); exact-match edits on that line must use NBSP
- Verified: build clean, screenshots of / (Thai), /en, mobile

## Previous Change (same day)
- MULTI-CATEGORY RESTRUCTURE ✅
  - New data/categories.ts = single source of truth for store
    structure (robot-mowers, pool-cleaners available;
    cleaning-robots, delivery-robots marked coming-soon)
  - products.ts: added `category: CategorySlug` field;
    `variant` is now ONLY the illustration style
  - Navbar: "Robot Mowers | Pool Cleaners" replaced by one
    "Shop ▾" dropdown generated from categories data —
    coming-soon categories show gold "SOON" badge, disabled
  - Mobile drawer: accordion sub-menus (Shop expanded default)
  - ProductCard: category label chip above product name
  - Verified via screenshots (desktop dropdown + mobile drawer)
- To add a category later: add one entry in data/categories.ts,
  nav updates automatically

## Last Session Summary
- HOME PAGE BUILT ✅ — all 8 sections complete and verified
  (hero, products, trust/stats, why-us, partners, news,
  YouTube CTA, footer) + navbar, announcement marquee,
  mobile drawer
- Animated hero: CSS/SVG robot mower crossing a lawn with
  cut-trail, gold fireflies, word-by-word headline (no video)
- Design system: navy #0D1B4B / #070F2E + gold #F5C842,
  fonts Archivo (display) / Inter (body) / IBM Plex Mono
  (prices, eyebrows, stats) via next/font
- lucide-react installed (NOTE: brand icons were removed from
  lucide — social/YouTube icons are inline SVGs in
  components/ui/BrandIcons.tsx)
- `npm run build` passes; verified visually at 1440px and
  375px via headless Edge screenshots
- Placeholder brand "RoboMart TH" used everywhere —
  search-replace when real brand name is decided

## Current Status
- Project setup: ✅ complete
- Home page: ✅ built (placeholder data, placeholder brand)
- All other pages: ❌ not started
- Payment: ❌ postponed to Phase 2 (no Omise code exists — correct)

## Next Session — Start Here
1. Read CLAUDE.md + history.md + index.md
2. Candidate next steps (ask user which):
   - Product detail page (/products/[id])
   - Real product images to replace SVG illustrations
   - Brand name finalization → replace "RoboMart TH"
   - Blog/news listing page
   - Contact / Book-a-demo form page

## Known Issues
- Hero cut-trail resets each 16s loop (by design, reads as a
  new mowing pass)
- Nav links point to section anchors (#products, #news, …)
  until real pages exist

## Important Decisions
- Brand name: [PLACEHOLDER "RoboMart TH"] — not decided yet
- Omise payment: POSTPONED — no payment code until Phase 2
- Reference site: robomate.com.au (PDF in docs/)
- SCOPE: general robotics store, NOT mower-only. Launch categories
  = mowers + pool cleaners; later = cleaning robots, delivery
  robots, and more. Keep nav/IA/data category-agnostic.
