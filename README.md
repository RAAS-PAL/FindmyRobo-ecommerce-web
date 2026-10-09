# FindMyRobo — e-commerce storefront

Bilingual (Thai/English) storefront and admin panel for **RAAS PAL**, selling
Mammotion robot mowers and related robotics in Thailand.

Production: [findmyrobo.com](https://www.findmyrobo.com) · Hosted on Vercel ·
Repo: `RAAS-PAL/FindmyRobo-ecommerce-web`

---

## Quick start

```bash
pnpm install
cp .env.example .env.local     # then fill in the Supabase values
pnpm dev                       # http://localhost:3000
```

Only the three Supabase variables are required to boot. Every other
integration degrades to a safe no-op when its keys are missing, so you can run
the whole site locally without Resend, Omise or Sokochan credentials — see
[Environment](#environment) below.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve a production build |
| `pnpm lint` | ESLint |
| `pnpm cms:types` | Regenerate `payload-types.ts` after changing a CMS field |
| `pnpm cms:importmap` | Regenerate the CMS admin's component map after adding a custom admin component |
| `pnpm cms:migration <name>` | Create a CMS database migration after changing a CMS field |

`pnpm build` runs pending CMS migrations first (`scripts/payload-migrate.mjs`).

## Stack

- **Next.js 16.3** (App Router) · **React 19** · **TypeScript** · ESM
  (`"type": "module"` — Payload requires it)
- **Payload CMS 3** — embedded in this app at `/cms`; see [CMS](#cms-payload)
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
  (`forest-*` scale, currently remapped to charcoal so the brand reads black +
  gold, and `gold`), not in a Tailwind config file
- **next-intl v4** — Thai is the default at `/`, English at `/en`
  (`localePrefix: "as-needed"`). Locale detection is deliberately **off**:
  everyone gets Thai first and switches via the toggle, which is remembered in
  a cookie
- **Supabase** — Postgres, auth, and storage (`@supabase/ssr`, httpOnly cookie
  sessions)
- **Resend** — transactional email · **Omise/Opn** — payments ·
  **Sokochan** — 3PL fulfilment
- **framer-motion**, **lucide-react**

## Layout

```
app/
  [locale]/          storefront — home, shop, product, checkout, account, about
  admin/(protected)/ admin panel — products, page builder, orders, fulfilment
  (payload)/         Payload CMS routes — /cms (editor) and /cms-api
  api/               route handlers (checkout, admin, webhooks, account)
payload/             CMS: collections, globals, admin components, migrations, seed
payload.config.ts    CMS configuration
components/
  sections/          home-page sections (hero, showcase, trust, …)
  product/           gallery, spec table, FAQ, page-builder block renderer
  admin/             admin-only UI (ProductForm, PageBuilder, ConfirmProvider)
data/                editable content: siteConfig, about, categories, techAnatomy
lib/                 server logic: stores, auth, email, payments, fulfilment
messages/            en.json / th.json — every UI string
supabase/            SQL schema and migrations (run by hand, see below)
i18n/                next-intl routing and request config
```

### Where content lives

Content is split on purpose, and it trips people up:

- **The CMS at `/cms`** (Payload) — marketing copy that changes: homepage
  hero, videos, showcase and stats, the announcement bar, the About page,
  phone/LINE/socials, SEO titles and descriptions, and their images. The
  storefront types and built-in **defaults** are in `data/siteContent.ts`: the
  site shows those when the CMS is not configured, and the CMS was seeded with
  them. After that, editing the defaults changes nothing live.
- **Supabase `products`** — the product catalogue, edited in Admin → Products.
- **`messages/{en,th}.json`** — UI chrome: labels, buttons, section headings.
- **`data/*.ts`** — what must stay behind a deploy: `siteConfig.ts` (the
  `showPrices` switch, the registered address and legal name), the refund
  policy, and the product technology anatomy, where every line traces to a
  manual.

So a string you can't find in `th.json` is probably in the CMS, or in its
defaults in `data/siteContent.ts`.

## CMS (Payload)

Payload 3 runs inside this Next.js app — same deployment, same database — so
there is no separate service to host or pay for.

- **Editor:** `/cms`. API: `/cms-api`. (Not Payload's default `/admin` and
  `/api` — those belong to the Supabase admin panel and the site's own API.)
- **Sign-in:** CMS accounts are Payload's own, separate from the site's
  Supabase accounts. The first account is created on the `/cms` screen the
  first time it is opened and becomes an **admin**; admins then add people in
  Settings → Users as **admin** or **marketing**. Marketing edits content and
  media; only admins manage users or change roles.
- **What it edits:** five globals — Homepage, Announcement bar, About page,
  Contact & social, SEO — each with Save Draft / Publish, version history with
  restore, and **Live Preview** (the real page beside the form, updating as you
  type). SEO shows a Google result and a LINE/Facebook card instead.
- **Publishing** regenerates the storefront (`payload/hooks.ts`); drafts never
  touch the live site.
- **Data:** the same Supabase Postgres, in its own `payload` schema — Payload's
  tables can never collide with `products`, `orders` or `profiles`. Media files
  go to the existing `product-photos` storage bucket under `cms/`, via the
  service key (`payload/storage/supabase.ts`) — no extra storage account.
- **Reading:** the storefront reads published content through
  `lib/siteContentStore.ts` and maps it with `lib/payloadContent.ts`.
- **Changing a field:** edit the global in `payload/globals/`, then
  `pnpm cms:types`, `pnpm cms:migration <name>`, and update the mapping in
  `lib/payloadContent.ts`. Migrations are applied by the next `pnpm build`.
- **First deploy:** the `seed_content` migration copies the site's current
  content and images into the CMS (`payload/seed.ts`), so editors start from
  the live copy. It converts oversized images to WebP on the way in.

## Media (S3)

Product photos, renders and videos live in the private S3 bucket `findmyrobo-media`
(Singapore), served through CloudFront at `https://d5hk9n8my7l32.cloudfront.net`.
Nothing new goes to Cloudinary.

- **Folders** mirror the shared media folder: `<Brand>/<Product>/<file>`, e.g.
  `Pudu/BellaBot/BellaBot.png`.
- **Link** = the CloudFront address + the file's key, spaces written `%20`. The S3
  console's "Object URL" answers 403 because the bucket is private: swap its start for
  the CloudFront address.
- **Compress before uploading.** S3 serves files exactly as uploaded. Videos: the ffmpeg
  recipe in `data/siteContent.ts` (no audio, `+faststart`). Photos: WebP or JPEG. Keep the
  original and put the small copy beside it as `<name>-web.<ext>`.
- **Upload** in the S3 console (drag into the folder), or
  `aws s3 cp file.webp "s3://findmyrobo-media/<Brand>/<Product>/" --cache-control "public, max-age=604800"`.
- **Use it:** product photos in `/admin` → Products; hero and gallery videos in `/cms` →
  Home; in code, `media("<Brand>/<Product>/<file>")` from `lib/media.ts`.
- **Replace** a file by uploading it under a new name and updating the link. Overwriting
  the same name keeps the old copy cached for up to 7 days (a CloudFront invalidation
  clears it).
- **Delete:** versioning is on, so "Show versions" in the console brings a file back.
- **Moving the host** (e.g. a custom domain): set `NEXT_PUBLIC_MEDIA_BASE_URL` — see
  Environment.

## Environment

Copy `.env.example` to `.env.local`. That file is the authoritative reference —
it documents every variable, what breaks without it, and which keys must never
reach the browser. Summary:

| Group | Required? | Without it |
| --- | --- | --- |
| Supabase (3 vars) | **Yes** | Nothing works |
| `RESEND_API_KEY` | No | Orders still save; emails skipped with a log warning |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Signup works, no CAPTCHA widget |
| Omise (2 vars) | No | Checkout creates the order and shows "our team will contact you" |
| Sokochan (2 vars) | No | Admin "Send to warehouse" shows a not-connected state |
| `NEXT_PUBLIC_SITE_URL` | Production | Payment returns fall back to the request origin |
| `DATABASE_URL` + `PAYLOAD_SECRET` | For the CMS | CMS off; the site shows its built-in content |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | No | Media loads from the default CloudFront address. Set it to move every media link (code, products, CMS) without a code change; redeploy after changing it on Vercel (`lib/media.ts`) |

Anything without a `NEXT_PUBLIC_` prefix is server-only. `SUPABASE_SECRET_KEY`
bypasses row-level security and `OMISE_SECRET_KEY` moves money — neither may
ever be exposed to the browser.

## Database setup

The SQL is applied by hand in the Supabase dashboard (SQL Editor → New query →
paste → Run). Files are re-runnable. Order matters:

1. `schema.sql` — auth, profiles, roles
2. `products-schema.sql`, `orders-schema.sql`, `addresses-schema.sql`,
   `reviews-schema.sql`
3. every `add-*.sql` migration
4. `seed-installation-packages.sql`, `seed-demo-packages.sql` (optional demo data)

### Becoming an admin

There is no admin password. Sign up through the normal storefront flow, then
set your profile row to `role = 'admin'` (step 4 of `schema.sql`). The admin
panel is at `/admin`.

Marketing staff don't need a Supabase admin account: they edit content in the
CMS at `/cms`, which has its own users and roles (see [CMS](#cms-payload)).

Role escalation is blocked at the database: `authenticated` has column-level
`UPDATE` grants on `profiles` for `full_name`, `phone`, `marketing_opt_in` and
`updated_at` only — a customer cannot make themselves an admin, even by
crafting the request by hand.

## Quotation mode

`siteConfig.showPrices` is currently **`false`**. The site sells by quotation:
no price is rendered anywhere a customer can see, while prices are still read
from the catalogue, still priced server-side at checkout, and still shown to
sales in the alert email and the admin panel.

`siteConfig.cartEnabled` is also **`false`**: there is no cart. Every
"interested" button opens one quote form (`components/quote/*`) with the
product preselected, `/checkout` redirects home and `POST /api/checkout`
returns 404. Quote requests are emailed to `SALES_ALERT_EMAIL` only
(`app/api/quotes`) — they are not stored, so a missing `RESEND_API_KEY` loses
them.

Flip both to `true` when card payment goes live. No other change is needed.

## Deployment

Vercel builds `main` automatically. Environment variables are set in the Vercel
project — **changing one requires a redeploy**, it does not apply to a running
deployment.

Vercel restores a build cache between deployments, and once served a stale
compiled `app/globals.css` (new CSS custom properties missing live). After
changing that file, check the live stylesheet; if it's stale, redeploy without
the cache (dashboard → Redeploy → untick "Use existing Build Cache").

The storefront is statically generated, but the admin product routes call
`revalidatePath` on every save, so catalogue edits publish immediately — no
redeploy needed. So does publishing in the CMS. Content that lives in
`data/*.ts` or `messages/*.json` is the opposite: it is compiled in, and
changing it does require a deploy.

Set `DATABASE_URL` for **Production only** in Vercel: `pnpm build` applies CMS
migrations, and a preview branch must not migrate the live database. Preview
deployments then build with the built-in content.

## Conventions

- Comments explain *why*, not *what* — particularly where something looks odd
  on purpose. `data/techAnatomy.ts` carries a sourcing rule worth reading
  before touching product copy: every product claim must trace to the manual,
  its spec table, or a photograph. Warranty-adjacent promises are not ours to
  invent.
- Destructive admin actions go through `components/admin/ConfirmProvider.tsx`,
  not `window.confirm`.
- `messages/en.json` and `messages/th.json` must keep identical key sets.
