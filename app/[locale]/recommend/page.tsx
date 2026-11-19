import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RobotFinder from "@/components/recommend/RobotFinder";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recommend" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: pageAlternates(locale, "/recommend"),
  };
}

export default async function RecommendPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recommend");

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div>
          <h1 className="mt-3 font-display text-title text-content">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-xl text-body text-ink-muted">{t("sub")}</p>
        </div>
        <div className="mt-8 sm:mt-10">
          <RobotFinder />
        </div>
      </div>
    </main>
  );
}
