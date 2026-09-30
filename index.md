# Project Index — FindMyRobo (RAAS PAL)

## Status: live at findmyrobo.com, quote-only mode (2026-09-30)

Current state, open items and gotchas: `hot.md`. Setup, env vars, DB, CMS,
deployment: `README.md`.

## Code map

### Storefront — `app/[locale]/` (Thai at `/`, English at `/en`)
- `layout.tsx` — root layout: fonts, `ThemeScript`, providers (intl, motion,
  products, site content, cart, quote, compare), AnnouncementBar, Navbar,
  Footer, QuoteDrawer
- `page.tsx` — homepage sections (`components/sections/*`)
- `shop/`, `shop/[category]/` — listings (coming-soon categories get a teaser)
- `products/[id]/` — product page (gallery, specs, tech anatomy, FAQ, reviews,
  floating bar); `products/request-a-demo` is the demo booking product
- `about/`, `contact-sales/`, `location/`, `refund-policy/`, `compare/`,
  `search/`, `order-status/`
- `login/`, `signup/`, `forgot-password/`, `reset-password/`, `account/`
- `checkout/` — switched off while `siteConfig.cartEnabled` is false

### Admin and CMS
- `app/admin/(protected)/` — Supabase-role admin: products, page builder,
  orders, fulfilment (`components/admin/*`)
- `app/(payload)/cms`, `cms-api` — Payload CMS; config `payload.config.ts`,
  schema in `payload/` (collections, globals, migrations, seed, storage),
  content reader `lib/payloadContent.ts`

### API — `app/api/`
- `quotes/` — quote form → email to sales (quote-only flow)
- `checkout/` (+ `pay`, `promptpay`), `webhooks/omise`, `webhooks/sokochan`
- `admin/*`, `account/*`, `orders/*`, `reviews/`

### Components
- `layout/` — Navbar (gold track, menus, drawer), ProfileMenu, CatalogSearch,
  LanguageSwitcher, AnnouncementBar, Footer, ThemeToggle (admin only)
- `quote/` — QuoteForm (card + panel variants), HeroQuote, QuoteDrawer,
  QuoteProvider, LineChatButton
- `sections/` — HeroSection and the other homepage sections
- `contact/` — ContactSalesBody, LocationBody
- `product/`, `cart/`, `checkout/`, `compare/`, `account/`, `auth/`, `about/`,
  `ui/`, `seo/`
- `SiteContentProvider`,
  `ProductsProvider`, `MotionProvider`

### Data, config, copy
- `data/siteConfig.ts` — business switches (`showPrices`, `cartEnabled`),
  registered address, Google Maps place + URLs, organisation
- `data/siteContent.ts`, `data/about.ts` — built-in content (CMS fallback)
- `data/categories.ts` — categories (nav derives from it); `data/products.ts`,
  `products.json` — fallback catalogue (live catalogue is in Supabase)
- `data/techAnatomy.ts`, `data/returnPolicy.ts`
- `messages/en.json`, `messages/th.json` — all UI copy (identical key sets)
- `app/globals.css` — Tailwind v4 `@theme` tokens, hero vars
  (`--hero-split`, `--hero-lean`), nav track, animations

### Library — `lib/`
- `supabase/` (client, server, service, middleware), `productStore.ts`,
  `orderStore.ts`, `addressStore.ts`, `reviewStore.ts`, `siteContentStore.ts`
- `quoteRequest.ts` (quote validation), `checkout.ts`, `email.ts`,
  `notifications.ts`, `omise.ts`, `sokochan.ts`, `rateLimit.ts`
- `seo.ts`, `structuredData.ts`, `siteUrl.ts`

### Other
- `middleware.ts` — locale routing + Supabase session refresh
- `i18n/` — next-intl routing/navigation/request
- `supabase/*.sql` — schema + migrations, applied by hand (README)
- `scripts/payload-migrate.mjs` — runs before `next build`
- `docs/` — reference material (internal spreadsheets are gitignored)
