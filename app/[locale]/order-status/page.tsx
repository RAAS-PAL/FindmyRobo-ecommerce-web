import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PackageSearch } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
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
    <main className="flex-1 bg-cloud">
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-20">
        <FadeIn>
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest-950 text-gold">
              <PackageSearch className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
              {t("heading")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("sub")}</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.08}>
          <OrderLookupForm />
        </FadeIn>
      </div>
    </main>
  );
}
