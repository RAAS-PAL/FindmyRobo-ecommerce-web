import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AboutView from "@/components/about/AboutView";
import { pageAlternates } from "@/lib/seo";
import { getSiteContent } from "@/lib/siteContentStore";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle"), alternates: pageAlternates(locale, "/about") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { about } = await getSiteContent();
  return <AboutView published={about} />;
}
