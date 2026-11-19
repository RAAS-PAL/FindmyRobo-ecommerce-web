import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LocationBody from "@/components/contact/LocationBody";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "location" });
  return {
    title: t("metaTitle"),
    description: t("sub"),
    alternates: pageAlternates(locale, "/location"),
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("location");

  return (
    <main className="bg-surface">
      <PageHeader title={t("heading")} lead={t("sub")} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <LocationBody />
      </div>
    </main>
  );
}
