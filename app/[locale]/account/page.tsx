import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, UserRound } from "lucide-react";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth";
import FadeIn from "@/components/ui/FadeIn";
import SignOutButton from "@/components/auth/SignOutButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.account" });
  return { title: `${t("title")} — RoboStore TH` };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  if (!profile) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("auth.account");
  const displayName = profile.full_name || profile.email || "";
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const isAdmin = profile.role === "admin";

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <FadeIn>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-950 text-gold">
              <UserRound className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                {t("title")}
              </p>
              <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
                {t("greeting", { name: displayName })}
              </h1>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <dl className="mt-8 divide-y divide-forest-100 overflow-hidden rounded-2xl border border-forest-100 bg-surface">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-[13px] font-medium text-ink-muted">{t("email")}</dt>
              <dd className="text-[14px] font-semibold text-content">{profile.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-[13px] font-medium text-ink-muted">{t("role")}</dt>
              <dd className="text-[14px] font-semibold text-content">
                {isAdmin ? t("roleAdmin") : t("roleUser")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="text-[13px] font-medium text-ink-muted">{t("memberSince")}</dt>
              <dd className="text-[14px] font-semibold text-content">{memberSince}</dd>
            </div>
          </dl>
        </FadeIn>

        <FadeIn delay={0.14}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {isAdmin && (
              <NextLink
                href="/admin"
                className="flex min-h-[46px] items-center gap-2 rounded-full bg-forest-950 px-6 text-[13.5px] font-bold text-gold transition-colors hover:bg-forest-900"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {t("adminLink")}
              </NextLink>
            )}
            <SignOutButton />
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
