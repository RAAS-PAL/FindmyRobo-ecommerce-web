import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RobotCard from "@/components/ui/RobotCard";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Button, { buttonClass } from "@/components/ui/Button";
import CategoryTabs from "@/components/ui/CategoryTabs";
import { fieldControlClass } from "@/components/ui/Field";
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
    <main className="min-h-[65vh] bg-surface">
      <PageHeader
        title={query ? t("resultsFor", { query }) : t("heading")}
        lead={query && results.length > 0 ? t("resultCount", { count: results.length }) : undefined}
      >
        {/* The search field lives on the page: a plain GET form to this page,
            so it works before any script has loaded. */}
        <form role="search" action="" className="mt-8 flex max-w-xl gap-3">
          <label htmlFor="search-q" className="sr-only">
            {t("fieldLabel")}
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus={!query}
            placeholder={t("fieldLabel")}
            aria-describedby="search-hint"
            className={fieldControlClass}
          />
          <button type="submit" className={buttonClass({ size: "lg" })}>
            {t("submit")}
          </button>
        </form>
        <p id="search-hint" className="mt-2 text-small text-ink-muted">
          {t("emptyBody")}
        </p>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        {!query ? (
          // before a search: the categories as shortcuts
          <CategoryTabs />
        ) : results.length === 0 ? (
          <EmptyState
            title={t("noResultsTitle")}
            body={t("noResultsBody", { query })}
            action={<Button href="/shop">{t("browseAll")}</Button>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product) => (
              <RobotCard key={product.id} product={product} dense />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
