# Hot Cache — Last Updated: 2026-09-30

Read this first. It's the current state in one page; `README.md` has setup,
stack, layout, CMS, env vars and conventions in depth; `index.md` maps the
code; `history.md` is the dated log.

## What this is

FindMyRobo (findmyrobo.com): the bilingual Thai/English storefront of Raas Pal
Company Limited, selling Mammotion robot mowers in Thailand (pool, cleaning and
delivery robots are listed as "coming soon"). Thai is the default at `/`,
English at `/en`. Next.js 16.3 App Router, React 19, Tailwind v4, next-intl 4,
Supabase (auth, products, orders), Payload CMS 3 embedded at `/cms`, Resend
email. pnpm 12, Node ≥ 24, ESM. Repo `RAAS-PAL/FindmyRobo-ecommerce-web`, only
branch `main`.

## Current state (live)

- **Quote-only mode.** `data/siteConfig.ts`: `showPrices: false` (no prices
  anywhere a customer sees) and `cartEnabled: false` (no cart; `/checkout`
  redirects home and `POST /api/checkout` returns 404). Every "interested"
  button (product page, floating bar, compare, demo, installation, navbar)
  opens ONE quote form (`components/quote/*`) with the product preselected.
  The cart, checkout, Omise payments and Sokochan fulfilment code all still
  exist, switched off — flip the two flags back when selling online.
- **Quote requests email the sales team only** (`app/api/quotes/route.ts` →
  `SALES_ALERT_EMAIL` via Resend, reply-to = customer). Nothing goes to the
  customer until sales confirm prices (business decision, 2026-09-28). Requests
  are NOT saved to the database, and if `RESEND_API_KEY` is missing they are
  silently lost — see Open items.
- **CMS:** Payload at `/cms` edits homepage (hero videos/copy), announcement
  bar, About, contact/socials (incl. the LINE QR), SEO and media. Publishing
  revalidates the site — no deploy needed. `data/*.ts` and `messages/*.json`
  ARE compiled in and need a deploy.
- **Theme (on branch `claude/project-brief-review-sfx73n`, not yet on main):**
  one light theme only (dark mode removed), soft grey page (`--color-surface`
  `#f3f5f8`), graphite neutrals, electric-blue brand colour. The brand colour
  is one token, `accent-*` (plus `--accent-rgb`, `bg-accent-gradient`,
  `text-accent-gradient`) in `app/globals.css`: change it there to re-colour
  the site. Main still has black + gold with dark mode. Fonts: Barlow (display/body) with Prompt / Noto Sans Thai
  for Thai glyphs, IBM Plex Mono for eyebrows/labels.

## How work ships

- **A push to `main` deploys production automatically** (Vercel Git
  integration; Vercel project `e-commerce-raaspal`). Work has been committed
  straight to `main` since 2026-09-28; earlier work came through PRs from
  feature branches.
- **Build-cache gotcha (2026-09-29):** a push that changed `app/globals.css`
  deployed a STALE compiled stylesheet (Vercel restored its build cache): new
  `:root` custom properties were missing live and the hero frost collapsed to
  0px, while a local `next build` was correct. After any `globals.css` change,
  check the live CSS for the new rules; if they're missing, redeploy without
  the cache (Vercel dashboard → Redeploy → untick "Use existing Build Cache",
  or `vercel deploy --prod --force` from a clean checkout). Never deploy from a
  folder that holds local `.env*` files — the CLI uploads them.
- `pnpm build` runs Payload migrations first (`scripts/payload-migrate.mjs`)
  against whatever `DATABASE_URL` points at.

## Cloud / fresh-checkout sessions

- No `.env.local` in the repo. To boot the storefront you need at least
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the
  navbar's profile menu creates a Supabase client on mount).
- **Leave `DATABASE_URL` unset** unless you mean to touch the live CMS
  database: with it, `pnpm dev` edits live content and `pnpm build` migrates
  the production DB. Without it the CMS is off and the site shows its built-in
  content (`data/siteContent.ts`, `data/about.ts`) — fine for UI work.
- To check a build without migrations: `pnpm exec next build`.
- Verify UI changes with a headless browser (screenshots at 1440 and 390 px,
  light + dark, `/` Thai and `/en`); the site's owner reviews by screenshot.

## Recent work (2026-09-24 → 09-30), newest first

- **Homepage redesign, DJI-style** (branch `claude/project-brief-review-sfx73n`,
  Vercel preview only): hero slides per robot family (`data/homeShowcase.ts`:
  lawn mowing, then Gausium Phantas) with a progress tab bar and the quote
  card docked right; the LUBA hero is a studio render faded into a graphite
  set (`components/ui/StudioStage.tsx`); full-width banners for mowers and
  Phantas, half tiles for Pudu and T-Chef (`components/sections/RobotShowcase.tsx`,
  placeholders say which photo is needed). Quote form gained Phantas cleaning
  and T-Chef cooking. Navbar is transparent over the homepage hero until
  scroll (`header[data-clear]` in globals.css). The announcement bar is hidden
  (not rendered in `app/[locale]/layout.tsx`), so its CMS section currently
  does nothing. The hero photo sits in a box below the navbar and above the
  headline (`studioPhoto` in `data/homeShowcase.ts`) and scales to fit it.
  Copy for Phantas/Pudu/T-Chef is descriptive only until spec sheets arrive;
  their Thai lines are drafts.

- **Navbar** (`components/layout/Navbar.tsx`, `.nav-track` in globals.css): a
  3px gold track on the bar's bottom edge glides to the hovered/focused link
  (leading end first, glowing head) and rests under the current section
  (Products / About / Contact); About/Contact menus hang from that edge (pt-4)
  under the track; menu items have icons; the bare quote icon is now a gold
  "Get a quote" pill (gold disc on phones).
- **Profile menu** (`components/layout/ProfileMenu.tsx`): hover (mouse) or
  click/tap opens Sign in / Create account, or My account / Sign out when
  signed in (the Dark mode switch was removed with dark mode). The bar's "Book a Demo" button and
  standalone theme button were removed (Book a Demo stays under Contact and in
  the hero). "FindMyRobo TV" was removed from the menu.
- **Location page** `/location` (`components/contact/LocationBody.tsx`): Google
  Maps embed (no API key) of the company's Google Business listing
  (`siteConfig.salesContact.mapsPlace`); every "Open in Google Maps" link,
  directions link and the embed are built from it (`salesMapUrl`,
  `salesDirectionsUrl`, `salesMapEmbedUrl`). The street address alone matched
  several "Software Park" places.
- **Hero** (`components/sections/HeroSection.tsx`, `components/quote/*`):
  - Desktop (lg+): the left side is a frosted panel whose edge leans 6° and
    lines up with the nav's grey wedge as one straight line. Shared CSS vars in
    globals.css: `--hero-split` (where frost/wedge end; narrow at rest,
    `50%` while `html[data-quote-open]`, set by `HeroQuote`), `--hero-lean`
    (6deg), `--hero-split-mid` (frost width halfway down — the quote column is
    this wide so the card sits centred in the frost).
  - Below lg: no frost at all; the headline block is content-height so the
    quote card follows the buttons.
  - The section is `overflow: clip` (not hidden) on purpose: a hidden box is
    still a scroll container, and focusing the form once scrolled the hero's
    own content up, out of reach.
- **Quote form** (`components/quote/QuoteForm.tsx`): expands on focus. Opening
  it scrolls the WINDOW (never `scrollIntoView`): on touch + text field, an
  instant jump before the keyboard opens (card top just under the sticky
  header); otherwise a smooth glide to centre. Phone placeholder
  `+66 123456789` (validation accepts +66… and 0…). Optional note field.
- 2026-09-28: About story copy (with a guarded CMS migration), quote-only
  flow, PRD + Office lock files gitignored, repo made public.
- 2026-09-24: Payload CMS replaced a hand-built content editor.

## Open items / next candidates

- Save quote requests to a DB table + an `/admin` list for sales follow-up;
  fail loudly (not silently) when `RESEND_API_KEY` is missing.
- Automatic price/offer email to customers — waits on business decisions
  (prices in email? VAT-inclusive?; Pudu has no catalogue products yet).
- Admin login (`components/admin/LoginForm.tsx`) doesn't send a Turnstile
  `captchaToken` — add it before Supabase Auth CAPTCHA is switched on, or admin
  sign-in breaks.
- Payment gateway not chosen yet (Omise vs 2C2P). Omise caps PromptPay /
  instalments at ฿150,000; `app/api/checkout/promptpay` has no guard for that.
- Profile menu's signed-in state and the phone-keyboard scroll fix were tested
  in headless browsers only — confirm on a real account / real phone.
- Content still to verify: homepage "4.7★ Customer Rating" stat (no source),
  About stats ("77 provinces", "24h response"), placeholder About story photo,
  empty YUKA quick specs; English return policy says "RAASPAL Co., Ltd." but
  the registered name is "Raas Pal Company Limited".
- Known and accepted: in Thai on 1024–1366px screens the nav's grey slope runs
  through the last label "ศูนย์ช่วยเหลือ" (owner chose to keep the wording).
- Pre-existing lint errors (don't block builds; `next build` skips lint):
  `components/auth/Turnstile.tsx` (ref read during render),
  `components/cart/InstallPurchasePanel.tsx` (setState in effect).
- Optional cleanup: drop the old `site_content` tables
  (`supabase/drop-site-content.sql`) only after confirming /cms serves content.

## Gotchas

- `messages/en.json` and `messages/th.json` must keep identical key sets.
  Thai copy is reviewed by the Thai team — mark new Thai strings as drafts.
- Product claims must trace to the manual/spec table/photos
  (`data/techAnatomy.ts` has the rule). Don't claim a Mammotion partnership
  or exclusivity in copy until it's confirmed in writing.
- Supabase SQL is applied by hand (README → Database setup); run
  `supabase/add-product-brand.sql` before adding a non-Mammotion product.
- `HeroSection.tsx` headline separator contains a literal NBSP (U+00A0).
- Navbar (2026-09-30, branch): one tab per `nav: true` category in
  `data/categories.ts`, labelled by `categories.<slug>.nav` in messages:
  Lawn Mowers, Cleaner, Smart Equipment, Cooker, Delivery (the Pudu robots);
  Thai labels are drafts. Plus one "About" menu that also holds Contact and
  Support — all eight didn't fit on one line in Thai. Tabs show from xl
  (1280px); below that they're in the drawer. Category panels and the accent
  track are positioned against the `<header>` (the `<nav>` is deliberately not
  positioned) so panels span the full width. The Thai tab row has ~40px to
  spare at 1280px — re-measure if labels get longer. The search field sits in
  a fixed slot and opens leftwards over the tabs (it must not widen the bar).
- Models without a catalogue product (Phantas, Aventurier A1-Basic/A1-Youth,
  T-Chef TC-E10A, Pudu1/Pudu2/Bella/Ketty) live in `data/lineup.ts`: the
  navbar and category pages list them, and "Get a quote" sends `modelId`
  (checked server-side) so the sales email names the model. A category shows
  lineup models only while it has no catalogue products; when real products
  are added in Admin, add all of that category's models and drop its lineup
  entries.
- Gausium Phantas has a product page built in code (Admin → Products is
  blocked by Cloudflare in testing): content in `data/modelPages.ts` (specs
  from the business's spec sheet; Thai lines are drafts), layout in
  `components/model/ModelPageView.tsx`, route
  `app/[locale]/products/gausium-phantas/`. That static route wins over
  `products/[id]` — delete it when Phantas is added in Admin. Photos in
  `public/models/phantas/`.
- Phantas, Aventurier, T-Chef and the Pudu robots are second-hand stock,
  labelled "Pre-owned" (Thai draft: ผ่านการใช้งาน) everywhere they appear —
  cards, navbar menus, the Phantas page (badge + first spec row), the
  homepage slide and banners, and the sales email (decision 2026-10-01).
  Flag: `preOwned` in `data/lineup.ts` / `data/modelPages.ts`;
  `components/ui/PreOwnedBadge.tsx`. Open question: the hero promise
  "Warranty in Thailand" — what warranty applies to pre-owned units?

## Conventions for agents

- The repo is **public**: never commit secrets, `.env*` files or internal
  documents (`docs/PRD-*.xlsx` and Office `~$*` lock files are gitignored).
- Commit messages: a plain-English subject saying what changed for the user,
  a short body with the why; **no `Co-Authored-By` line** (owner's
  preference). Suggest a commit message after finishing a code feature.
- Ask before pushing to `main` — it deploys production.
- Keep comments explaining *why*; match the surrounding style.
