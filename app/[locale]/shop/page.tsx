import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CategoryTabs from "@/components/ui/CategoryTabs";
import FadeIn from "@/components/ui/FadeIn";
import ProductCard from "@/components/ui/ProductCard";
import { collapseInstallTiers, isInstallTier } from "@/lib/installTiers";
import { getAllProducts } from "@/lib/productStore";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/shop") };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const products = await getAllProducts();

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">{t("sub")}</p>
        </FadeIn>

        <div className="mt-10">
          <CategoryTabs />
        </div>

        <div className="mt-10 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collapseInstallTiers(products).map((product, i) => (
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
      </div>
    </main>
  );
}
