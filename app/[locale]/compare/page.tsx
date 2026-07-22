import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeftRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import ProductVisual from "@/components/ui/ProductVisual";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { getAllProducts } from "@/lib/productStore";
import {
  formatBaht,
  SERVICE_CATEGORY,
  SPEC_KEYS,
  type Locale,
  type Product,
} from "@/data/products";

export const dynamic = "force-dynamic";

/** PRD #30: side-by-side comparison of 2–3 robots, driven by ?ids=a,b,c. */
const MAX = 3;

async function resolveRobots(idsParam: string | undefined): Promise<Product[]> {
  const requested = [...new Set((idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean))];
  if (requested.length === 0) return [];
  // Storefront read — hidden products and services can never be compared.
  const catalog = await getAllProducts();
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return requested
    .flatMap((id) => {
      const p = byId.get(id);
      return p && p.category !== SERVICE_CATEGORY ? [p] : [];
    })
    .slice(0, MAX);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare.page" });
  // Ephemeral, selection-specific URLs — not for search indexes.
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const [{ locale }, { ids }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const [t, robots] = await Promise.all([
    getTranslations("compare.page"),
    resolveRobots(ids),
  ]);

  const loc = locale as Locale;

  if (robots.length < 2) {
    return (
      <main className="min-h-[65vh] bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <FadeIn>
            <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-forest-100 bg-surface px-6 py-16 text-center">
              <ArrowLeftRight className="h-10 w-10 text-gold-600" aria-hidden="true" />
              <h1 className="mt-4 font-display text-2xl font-extrabold text-content">
                {t("emptyTitle")}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                {t("emptyBody")}
              </p>
              <Link
                href="/shop"
                className="mt-6 flex min-h-12 items-center rounded-full bg-gold px-6 text-sm font-bold text-forest-950"
              >
                {t("browse")}
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>
    );
  }

  // Only spec rows at least one robot fills in are worth a row.
  const specKeys = SPEC_KEYS.filter((key) => robots.some((r) => r.specs[key]));

  return (
    <main className="min-h-[65vh] bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-muted">{t("sub")}</p>
        </FadeIn>

        <FadeIn delay={0.08}>
          {/* wide table scrolls inside its own container, never the page */}
          <div className="mt-10 overflow-x-auto rounded-2xl border border-forest-100 bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="align-bottom">
                  <th className="w-40 min-w-36 px-5 py-6" aria-hidden="true" />
                  {robots.map((robot) => (
                    <th key={robot.id} scope="col" className="px-5 py-6 font-normal">
                      <div className="flex h-32 items-center justify-center rounded-xl bg-cloud/60 p-2">
                        <ProductVisual product={robot} className="h-full w-auto max-w-full" />
                      </div>
                      <p className="mt-4 font-display text-lg font-extrabold leading-snug text-content">
                        <Link href={`/products/${robot.id}`} className="hover:text-gold-600">
                          {robot.name}
                        </Link>
                      </p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-content">
                        {formatBaht(robot.price)}
                      </p>
                      {robot.preorder && (
                        <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                          {t("preorder")}
                        </p>
                      )}
                      <p className="mt-2 text-[12.5px] font-normal leading-relaxed text-ink-muted">
                        {robot.tagline[loc] || robot.tagline.en}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specKeys.map((key, i) => (
                  <tr key={key} className={i % 2 === 0 ? "bg-cloud/40" : ""}>
                    <th
                      scope="row"
                      className="px-5 py-3.5 text-[12.5px] font-semibold text-content"
                    >
                      {t(`specs.${key}`)}
                    </th>
                    {robots.map((robot) => (
                      <td key={robot.id} className="px-5 py-3.5 text-[13.5px] text-ink-muted">
                        {robot.specs[key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className={specKeys.length % 2 === 0 ? "bg-cloud/40" : ""}>
                  <th
                    scope="row"
                    className="px-5 py-3.5 align-top text-[12.5px] font-semibold text-content"
                  >
                    {t("features")}
                  </th>
                  {robots.map((robot) => (
                    <td key={robot.id} className="px-5 py-3.5 align-top">
                      <ul className="space-y-2">
                        {(robot.features[loc] ?? robot.features.en).map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted"
                          >
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600"
                              aria-hidden="true"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th scope="row" className="px-5 py-5" aria-hidden="true" />
                  {robots.map((robot) => (
                    <td key={robot.id} className="px-5 py-5">
                      <div className="flex flex-col gap-2.5">
                        <AddToCartButton productId={robot.id} />
                        <Link
                          href={`/products/${robot.id}`}
                          className="flex min-h-[44px] items-center justify-center rounded-full border-2 border-forest px-5 text-[13px] font-semibold text-content transition-colors hover:border-gold hover:text-gold-600"
                        >
                          {t("viewProduct")}
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
