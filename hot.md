# Hot Cache — Last Updated: 2026-10-08

Read this first. It's the current state in one page; `README.md` has setup,
stack, layout, CMS, env vars and conventions in depth; `index.md` maps the
code; `history.md` is the dated log.

## What this is

FindMyRobo (findmyrobo.com): the bilingual Thai/English storefront of Raas Pal
Company Limited. Live catalogue: Mammotion robot mowers, Gausium Phantas,
Aventurier A1-Youth and T-Chef TC-E10A. Pool cleaners, A1-Basic, the four
Pudu robots and the test product `c40` stay hidden. Thai is the default at `/`,
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
- **Theme (live on main since the 2026-10-08 merge):** one light theme only
  (dark mode removed), soft grey page (`--color-surface` `#f3f5f8`), graphite
  neutrals, electric-blue brand colour. The brand colour is one token,
  `accent-*` (plus `--accent-rgb`, `bg-accent-gradient`,
  `text-accent-gradient`) in `app/globals.css`: change it there to re-colour
  the site. Fonts: Barlow (display/body) with Prompt / Noto Sans Thai for
  Thai glyphs, IBM Plex Mono for eyebrows/labels.

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
  Phantas, tiles for Pudu and T-Chef (`components/sections/RobotShowcase.tsx`).
  A slide or banner tied to a robot (`productId`) or a category shows only
  while that robot / a robot in that category is visible (`onShow` in
  `data/homeShowcase.ts`), so hidden robots never leave an empty photo slot;
  a lone tile spans the row. Quote form gained Phantas cleaning
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
  - 2026-10-08: the hero no longer adds a "Get a quote" button beside Learn
    more. The quote card is already on the slide, and the navbar still has
    one. Lawn mowing still shows Book a demo. The slide tabs render only when
    there is more than one slide, so a single slide does not leave a blank
    half. A homepage banner with no photo (Pudu) stays off. Shop filter pills
    follow the navbar: a category with nothing on show is not listed.
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

- **Robots into the database (2026-10-02, in progress).** SQL is run by hand
  in Supabase, after a backup, in this order:
  1. `supabase/add-multi-brand-catalogue.sql` — brand + conditions columns,
     new robot types. **Ran on live 2026-10-02.** (No `sku` column on purpose.)
  2. `supabase/allow-unknown-price.sql` — `price` may be null (not known
     yet): shown as "Price on request", kept out of cart and checkout
     (`hasPrice` / `PricedProduct` in data/products.ts). Run before step 3.
     **Ran on live 2026-10-02.**
     Until this branch is on main, the OLD live admin list can't show a
     product without a price.
  3. `supabase/seed-lineup-robots.sql` — the 8 code-only robots, HIDDEN,
     with no price (set prices in Admin). Nothing to edit before running. **Ran on live
     2026-10-02** (8 robots in, hidden, no price; c40 hidden).
  4. `supabase/add-recommender.sql` — `fit` column, `recommendation_requests`
     table, facts for Phantas and A1. Additive; safe any time after step 3.
     **Ran on live 2026-10-02** (3 robots with facts).
  4b. `supabase/fill-robot-pages.sql` — the full page content (text, photos,
     key figures, feature sections, spec table) for Gausium Phantas, T-Chef
     TC-E10A and Aventurier A1-Youth, generated from the old code-built pages.
     Leaves price, visible, fit and order alone; the rows stay hidden, so it
     is safe before the merge and safe to re-run. **Ran on live 2026-10-08**
     (Phantas, T-Chef TC-E10A and A1-Youth filled, still hidden).
     Tested on a local Postgres 18 after steps 1–4.
  Launch order is done (2026-10-08): 4b ran, preview branch merged to main
  (PR #1), step 5 ran, and the three robots were set `visible = true`.
  A1-Basic, the four Pudu robots and `c40` stay hidden. The Delivery tab and
  the Pudu homepage tile stay off until a Pudu robot is visible AND the tile
  has a real photo (`onShow` in `data/homeShowcase.ts`).
  **SQL visibility does not refresh the homepage.** Storefront pages are
  baked at deploy. A raw `UPDATE products SET visible` shows up on a product
  URL that was not in that build, but the homepage, navbar and shop stay on
  the snapshot until an Admin product save (`revalidatePath("/", "layout")`)
  or a production rebuild. After the visibility SQL the homepage was still
  lawn-only; production was rebuilt the same day
  (`e-commerce-raaspal-651gp8zwx`) and findmyrobo.com then showed Phantas,
  A1-Youth and TC-E10A.
  5. `supabase/variant-to-product-type.sql` — `variant` becomes the product
     type (mower, pool, cleaner, equipment, cooking, delivery, installation,
     demo), never a model name. Run it right AFTER this branch's code is live
     on main: old main code doesn't know the new values. Until then
     `lib/productStore.ts` reads luba/mini/install as the new values and keeps
     each LUBA's clip and diagram (LEGACY_VARIANTS, delete after step 5).
     The parts diagram is now picked per page section (`anatomy` block
     `model`), only for the model it describes: YUKA Mini 2 and LUBA Mini 2
     AWD 1000 get none. Live row `c40` (Cleaner, price 999999) looks like a
     test product — hide it before going live (it would also be offered by
     the recommender for floor cleaning).
     Preview-only: set `SHOW_HIDDEN_PRODUCTS=1` on Vercel's Preview
     environment to see hidden robots on preview deployments (ignored on
     production).

- **Robot recommender — built 2026-10-02 (hybrid, phase 1).** `/recommend`
  (EN/TH), linked from the hero ("Not sure which robot fits?"), About menu →
  "Find my robot", and the footer. Steps: job (lawn / floor / cooking /
  delivery) → follow-ups (area + slope; area + self-driving or pushed; venue;
  cooking has none and goes straight to results) → 1 to 3 robots with
  reasons. No new/pre-owned question (owner, 2026-10-02: customers shouldn't
  have to think about it; the cards still show how each is sold). Rules + score in `lib/recommend.ts`
  (pure; the API re-runs it); facts per product in `fit` (Admin → Products →
  "Recommendation facts"; mowers fall back to their area/slope specs); a
  missing figure shows "to be confirmed", never a guess. Answers saved to
  `recommendation_requests` on results. Contact is optional: under the
  results only an offer ("Yes, contact me") until tapped; then name, phone,
  optional email, PDPA consent, emailed to sales. No budget question
  until prices exist. Phase 2 (LLM wording / free text) not started.
  Needs `supabase/add-recommender.sql` (after the seed). Open: PDPA consent
  wording and the Privacy Policy page (footer still has none) for legal review;
  Thai copy is a draft; T-Chef and Pudu have no facts the questions use, so
  they match on job + condition only.

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
  a tab shows only while its category has a visible product (Delivery is
  hidden until a Pudu robot is switched on); Thai labels are drafts. Plus one "About" menu that also holds Contact and
  Support — all eight didn't fit on one line in Thai. Tabs show from xl
  (1280px); below that they're in the drawer. Category panels and the accent
  track are positioned against the `<header>` (the `<nav>` is deliberately not
  positioned) so panels span the full width. The Thai tab row has ~40px to
  spare at 1280px — re-measure if labels get longer. The search field sits in
  a fixed slot and opens leftwards over the tabs (it must not widen the bar).
- **Every robot is an Admin product** (branch, 2026-10-07). The code-only
  robots (`data/lineup.ts`), the code-built pages (`data/modelPages.ts`,
  `components/model/ModelPageView.tsx`, the static `products/gausium-phantas`,
  `t-chef-tc-e10a`, `aventurier-a1-youth` routes) and the quote form's
  `modelId` are gone. Navbar, category pages, homepage and quote form read
  only Supabase products; hidden products appear nowhere (`showsOnStorefront`
  in `lib/productStore.ts`; `SHOW_HIDDEN_PRODUCTS=1` shows them on previews).
- **Full-screen product page** (Admin → Products → page builder → "Full-screen
  page"): when a product's `page.showcase` is set, `products/[id]` renders
  `components/product/ShowcasePage.tsx` (DJI-style dark header with the
  robot, the line above the name, up to 4 key figures, optional colours;
  one full-width photo per Feature section that has an image; spec table).
  Feature sections without an image, What's in the box and FAQ still show
  under it. Off = the standard gallery page. Validated in
  `lib/productValidation.ts` (`parsePage`). Photos stay in `public/models/`
  and `public/studio/`.
- How each robot is sold is the product's `conditions` column (`new`,
  `pre-owned` or both; helpers in `data/conditions.ts`). The label shows on
  cards and menus only when pre-owned is among them (`showsCondition`); the
  full-screen header and spec table always show it; the quote form asks
  brand-new or pre-owned when both apply. Thai "ผ่านการใช้งาน" is a draft.
  Open question: the hero promise "Warranty in Thailand" — what warranty
  applies to pre-owned units?

## Conventions for agents

- The repo is **public**: never commit secrets, `.env*` files or internal
  documents (`docs/PRD-*.xlsx` and Office `~$*` lock files are gitignored).
- Commit messages: a plain-English subject saying what changed for the user,
  a short body with the why; **no `Co-Authored-By` line** (owner's
  preference). Suggest a commit message after finishing a code feature.
- Ask before pushing to `main` — it deploys production.
- Keep comments explaining *why*; match the surrounding style.
