import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ModelPageView from "@/components/model/ModelPageView";
import { getModelPage } from "@/data/modelPages";
import { pick } from "@/data/siteContent";
import { pageAlternates } from "@/lib/seo";

/*
 * Aventurier A1-Youth, built in code (data/modelPages.ts) until it can be
 * added in Admin → Products. A static route, so it wins over products/[id]:
 * delete this folder when the admin product exists.
 */
const ID = "aventurier-a1-youth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = getModelPage(ID);
  if (!page) return {};
  return {
    title: `${page.brand} ${page.name} — FindMyRobo`,
    description: pick(page.metaDescription, locale),
    alternates: pageAlternates(locale, `/products/${ID}`),
  };
}

export default async function AventurierA1YouthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = getModelPage(ID);
  if (!page) notFound();
  return <ModelPageView page={page} />;
}
