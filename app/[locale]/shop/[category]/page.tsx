import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import CategoryTabs from "@/components/ui/CategoryTabs";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ShopList from "@/components/shop/ShopList";
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
  const slug = cat.slug as CategorySlug;
  // Robots on show only: a category whose robots are all still hidden (no
  // photos or specs yet) shows the coming-soon panel instead of empty cards.
  const items = await getProductsByCategory(slug);

  return (
    <main className="bg-surface">
      <PageHeader title={tc(`${slug}.name`)} lead={tc(`${slug}.description`)} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <CategoryTabs active={slug} />
        <div className="mt-10">
          {cat.available && items.length > 0 ? (
            <ShopList products={items} locale={locale} />
          ) : (
            <EmptyState
              title={t("comingSoonTitle")}
              body={t("comingSoonBody")}
              action={
                <>
                  <Button href="/products/request-a-demo">{t("bookDemo")}</Button>
                  <Button href="/shop" variant="secondary">
                    {t("backToShop")}
                  </Button>
                </>
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
