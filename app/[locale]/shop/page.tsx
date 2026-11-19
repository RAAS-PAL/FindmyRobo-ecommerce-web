import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CategoryTabs from "@/components/ui/CategoryTabs";
import PageHeader from "@/components/ui/PageHeader";
import ShopList from "@/components/shop/ShopList";
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
    <main className="bg-surface">
      <PageHeader title={t("heading")} lead={t("sub")} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <CategoryTabs />
        <div className="mt-10">
          <ShopList products={products} locale={locale} />
        </div>
      </div>
    </main>
  );
}
