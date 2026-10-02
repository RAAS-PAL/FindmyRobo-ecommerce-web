import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FadeIn from "@/components/ui/FadeIn";
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
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-muted">{t("sub")}</p>
        </FadeIn>
        <div className="mt-8 sm:mt-10">
          <RobotFinder />
        </div>
      </div>
    </main>
  );
}
