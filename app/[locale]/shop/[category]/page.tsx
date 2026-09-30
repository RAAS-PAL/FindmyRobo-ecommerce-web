import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bot, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import CategoryTabs from "@/components/ui/CategoryTabs";
import FadeIn from "@/components/ui/FadeIn";
import ProductCard from "@/components/ui/ProductCard";
import { collapseInstallTiers, isInstallTier } from "@/lib/installTiers";
import { categories, type CategorySlug } from "@/data/categories";
import { getProductsByCategory } from "@/lib/productStore";
import { pageAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, category: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!categories.some((c) => c.slug === category)) return {};
  const tc = await getTranslations({ locale, namespace: "categories" });
  return {
    title: `${tc(`${category}.name`)} — FindMyRobo`,
    alternates: pageAlternates(locale, `/shop/${category}`),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const t = await getTranslations("shop");
  const tc = await getTranslations("categories");
  const tn = await getTranslations("nav");
  const slug = cat.slug as CategorySlug;
  const items = await getProductsByCategory(slug);

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {tc(`${slug}.name`)}
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">{tc(`${slug}.description`)}</p>
        </FadeIn>

        <div className="mt-10">
          <CategoryTabs active={slug} />
        </div>

        {cat.available && items.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collapseInstallTiers(items).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                {...(isInstallTier(product)
                  ? { displayName: t("installCardName"), displayTagline: t("installCardTagline") }
                  : {})}
              />
            ))}
          </div>
        ) : (
          <FadeIn className="mt-10">
            <div className="flex flex-col items-center rounded-3xl border border-forest-100 bg-surface px-6 py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest text-accent-300">
                <Bot className="h-8 w-8" aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-display text-2xl font-extrabold text-content sm:text-3xl">
                {t("comingSoonTitle")}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                {t("comingSoonBody")}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Link
                  href="/products/request-a-demo"
                  className="flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-7 text-sm font-bold text-on-accent transition-shadow duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)]"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {tn("bookDemo")}
                </Link>
                <Link
                  href="/shop"
                  className="flex min-h-[48px] items-center rounded-full border border-forest-100 px-7 text-sm font-semibold text-content transition-colors hover:border-accent"
                >
                  {t("backToShop")}
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </main>
  );
}
