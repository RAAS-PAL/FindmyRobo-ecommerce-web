import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FadeIn from "@/components/ui/FadeIn";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { siteConfig } from "@/data/siteConfig";
import { redirect } from "@/i18n/navigation";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/checkout") };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Cart switched off (siteConfig.cartEnabled): nothing leads here any more,
  // and an old bookmark or a cart saved in the browser must not reach payment.
  if (!siteConfig.cartEnabled) redirect({ href: "/", locale });
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">{t("sub")}</p>
        </FadeIn>

        <div className="mt-12">
          <CheckoutClient />
        </div>
      </div>
    </main>
  );
}
