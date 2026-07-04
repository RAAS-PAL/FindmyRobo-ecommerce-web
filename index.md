# Project Index — E-commerce RAASPAL

## Status: Building — home page complete (2026-07-04)

## Code Map
- app/[locale]/page.tsx — home page (imports all sections)
- app/[locale]/shop/page.tsx — all-products listing with category pills
- app/[locale]/shop/[category]/page.tsx — category pages (+ coming-soon empty state)
- app/[locale]/products/[id]/page.tsx — product detail (specs, features, related)
- app/[locale]/layout.tsx — fonts (incl. Thai), i18n provider, nav, footer
- app/globals.css — navy/gold design tokens + keyframe animations
- i18n/ — next-intl routing (th default at /, en at /en), navigation, request config
- middleware.ts — locale routing
- messages/th.json + en.json — ALL site copy lives here (Thai needs native review)
- components/layout/ — Navbar, Footer, AnnouncementBar
- components/sections/ — Hero, ProductGrid, Trust, WhyUs, Partners, News, YouTubeCTA
- components/ui/ — ProductCard, AnimatedCounter, RobotIllustration, BrandIcons
- data/categories.ts — category source of truth (nav derives from this)
- data/products.ts — 6 placeholder products (฿ prices), each tagged with category

## Key Decisions
- [[vault/projects/tech-stack-decision]]
- [[vault/projects/payment-gateway-decision]]
- [[vault/projects/brand-name-decision]]

## Pending Items
- [ ] Finalize brand name + domain
- [ ] Register Omise account
- [ ] Get Sokochan API docs
- [ ] Confirm product data from Chris/Pommy

## Resources
- [[vault/resources/robomate-australia-reference]]
- [[vault/resources/sokochan-api-notes]]