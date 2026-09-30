# Project: FindMyRobo — E-commerce RAASPAL

## What This Project Is
A standalone Next.js e-commerce website for RAAS PAL (Raas Pal Company
Limited) to sell robots in Thailand: Mammotion robot mowers now; pool,
cleaning and delivery robots later. Live at findmyrobo.com.
Reference design: robomate.com.au (Robomate Australia).

This is a SEPARATE project from robot-recommendation-api
and other AISolution work. Do not cross-reference unless
explicitly told to.

## Session Start Instructions
1. Read hot.md FIRST — current state, open items, gotchas
2. Read index.md — code map
3. Skim history.md — dated log of what was built when
4. README.md — setup, env vars, database, CMS, deployment
5. Then read the rest of this file
6. Confirm understanding before writing any code

## Confirmed Decisions
- Tech stack: Next.js (frontend + backend, no Java), pnpm
- Selling by quotation for now: `siteConfig.showPrices = false` and
  `siteConfig.cartEnabled = false`. Quote requests email the sales team only;
  nothing goes to the customer until sales confirm prices.
- Payment: Omise (card + PromptPay) is integrated but switched off with the
  cart; the gateway choice (Omise vs 2C2P) is still open
- Fulfillment: Sokochan REST API (integrated, gated behind admin action)
- Hosting: Vercel — a push to `main` deploys production
- Currency: Thai Baht (฿)
- CMS: Payload 3, embedded in this app at /cms (decided 2026-09-24; replaced
  a short-lived hand-built editor). Own users (admin/marketing), data in the
  `payload` schema of the same Supabase Postgres. See README → CMS.

## Design Rules
- Use ui-ux-pro-max skill for color/font/layout decisions
- Use frontend-design skill for aesthetic direction
- Ground design in real reference: Robomate Australia structure
- Colors: LIGHT theme is the default. The brand currently reads BLACK + gold:
  the `forest-*` tokens in app/globals.css @theme are remapped to a charcoal
  scale ("green → black", 2026-07-30, still live). The CEO's 2026-07-08
  decision was forest green + yellow — the greens are in git history if asked
  to restore them. Gold `#f5c842`.
- Hero: video playlist from the CMS (Homepage → hero videos); the animated
  lawn scene is the fallback when none is set

## Brand
- FindMyRobo / findmyrobo.com (decided 2026-08-07). Legal entity:
  Raas Pal Company Limited (บริษัท ราส พอล จำกัด)

## Working Agreements
- Commit messages: plain-English subject about what changed for the user,
  short body with the why, NO `Co-Authored-By` line. Suggest a commit message
  after finishing a code feature.
- Ask before pushing to `main` — it deploys production.
- The repo is public: never commit secrets, `.env*` files or internal docs.
- Verify UI changes with screenshots (desktop + phone, light + dark, Thai + EN).
