import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OrderLookupForm from "@/components/orders/OrderLookupForm";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orderStatus" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/order-status") };
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("orderStatus");

  return (
    <main className="flex-1 bg-surface">
      <PageHeader title={t("heading")} lead={t("sub")} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="max-w-xl">
          <OrderLookupForm />
        </div>
      </div>
    </main>
  );
}
