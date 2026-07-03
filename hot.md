# Hot Cache — Last Updated: 2026-07-04

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
- Placeholder brand "RoboStore TH" used everywhere —
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
   - Brand name finalization → replace "RoboStore TH"
   - Blog/news listing page
   - Contact / Book-a-demo form page

## Known Issues
- Hero cut-trail resets each 16s loop (by design, reads as a
  new mowing pass)
- Nav links point to section anchors (#products, #news, …)
  until real pages exist

## Important Decisions
- Brand name: [PLACEHOLDER "RoboStore TH"] — not decided yet
- Omise payment: POSTPONED — no payment code until Phase 2
- Reference site: robomate.com.au (PDF in docs/)
- SCOPE: general robotics store, NOT mower-only. Launch categories
  = mowers + pool cleaners; later = cleaning robots, delivery
  robots, and more. Keep nav/IA/data category-agnostic.
