import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactSalesBody from "@/components/contact/ContactSalesBody";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactSales" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/contact-sales") };
}

export default async function ContactSalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactSales");

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div>
          <h1 className="mt-3 font-display text-title text-content">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-xl text-body text-ink-muted">{t("sub")}</p>
        </div>

        <ContactSalesBody />
      </div>
    </main>
  );
}
