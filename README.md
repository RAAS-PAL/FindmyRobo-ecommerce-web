# FindMyRobo — e-commerce storefront

Bilingual (Thai/English) storefront and admin panel for **RAAS PAL**, selling
Mammotion robot mowers and related robotics in Thailand.

Production: [findmyrobo.com](https://www.findmyrobo.com) · Hosted on Vercel ·
Repo: `RAAS-PAL/FindmyRobo-ecommerce-web`

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the Supabase values
npm run dev                    # http://localhost:3000
```

Only the three Supabase variables are required to boot. Every other
integration degrades to a safe no-op when its keys are missing, so you can run
the whole site locally without Resend, Omise or Sokochan credentials — see
[Environment](#environment) below.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |

## Stack

- **Next.js 16.2.9** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
  (`forest-*` green scale + `gold`), not in a Tailwind config file
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
  api/               route handlers (checkout, admin, webhooks, account)
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

- **`messages/{en,th}.json`** — UI chrome: labels, buttons, headings.
- **`data/*.ts`** — company content: the About page copy, site config, the
  product technology anatomy. Bilingual `{ en, th }` pairs inline.
- **Supabase** — the product catalogue, edited through the admin panel.

So a string you can't find in `th.json` is probably in `data/about.ts`.

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

Role escalation is blocked at the database: `authenticated` has column-level
`UPDATE` grants on `profiles` for `full_name`, `phone`, `marketing_opt_in` and
`updated_at` only — a customer cannot make themselves an admin, even by
crafting the request by hand.

## Quotation mode

`siteConfig.showPrices` is currently **`false`**. The site sells by quotation:
no price is rendered anywhere a customer can see, while prices are still read
from the catalogue, still priced server-side at checkout, and still shown to
sales in the alert email and the admin panel.

Flip it to `true` when card payment goes live. No other change is needed.

## Deployment

Vercel builds `main` automatically. Environment variables are set in the Vercel
project — **changing one requires a redeploy**, it does not apply to a running
deployment.

The storefront is statically generated, but the admin product routes call
`revalidatePath` on every save, so catalogue edits publish immediately — no
redeploy needed. Content that lives in `data/*.ts` or `messages/*.json` is the
opposite: it is compiled in, and changing it does require a deploy.

## Conventions

- Comments explain *why*, not *what* — particularly where something looks odd
  on purpose. `data/techAnatomy.ts` carries a sourcing rule worth reading
  before touching product copy: every product claim must trace to the manual,
  its spec table, or a photograph. Warranty-adjacent promises are not ours to
  invent.
- Destructive admin actions go through `components/admin/ConfirmProvider.tsx`,
  not `window.confirm`.
- `messages/en.json` and `messages/th.json` must keep identical key sets.
