import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search, SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ui/ProductCard";
import FadeIn from "@/components/ui/FadeIn";
import { getAllProducts } from "@/lib/productStore";
import { searchProducts } from "@/lib/productSearch";
import type { Locale } from "@/data/products";
import { pageAlternates } from "@/lib/seo";

type SearchParams = Promise<{ q?: string | string[] }>;

const queryValue = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 100) ?? "";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const query = queryValue((await searchParams).q);
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: query ? t("metaTitleQuery", { query }) : t("metaTitle"),
    alternates: pageAlternates(locale, "/search"),
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = queryValue((await searchParams).q);
  const [t, tc, products] = await Promise.all([
    getTranslations("search"),
    getTranslations("categories"),
    getAllProducts(),
  ]);
  const results = query
    ? searchProducts(products, query, locale as Locale, (slug) => tc(`${slug}.name`))
    : [];

  return (
    <main className="min-h-[65vh] bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {query ? t("resultsFor", { query }) : t("heading")}
          </h1>
          {query && results.length > 0 && (
            <p className="mt-4 text-base text-ink-muted">
              {t("resultCount", { count: results.length })}
            </p>
          )}
        </FadeIn>

        {!query ? (
          <FadeIn delay={0.08}>
            <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-forest-100 bg-surface px-6 py-16 text-center">
              <Search className="h-10 w-10 text-accent-600" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl font-bold text-content">{t("emptyTitle")}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{t("emptyBody")}</p>
            </div>
          </FadeIn>
        ) : results.length === 0 ? (
          <FadeIn delay={0.08}>
            <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-forest-100 bg-surface px-6 py-16 text-center">
              <SearchX className="h-10 w-10 text-accent-600" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl font-bold text-content">{t("noResultsTitle")}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                {t("noResultsBody", { query })}
              </p>
              <Link href="/shop" className="mt-6 flex min-h-12 items-center rounded-lg bg-accent px-6 text-sm font-bold text-on-accent">
                {t("browseAll")}
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
