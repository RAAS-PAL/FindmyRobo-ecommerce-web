import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { pageAlternates } from "@/lib/seo";

// The recovery session is established per-request by /auth/confirm, so this
// page must never be served from the static cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.resetPassword" });
  return { title: `${t("title")} — FindMyRobo`, alternates: pageAlternates(locale, "/reset-password") };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Reaching this page means the recovery token was verified and a session
  // exists. Without one the link was expired, already used, or typed directly —
  // send them back to request a fresh email rather than showing a form that
  // cannot work.
  if (!(await getProfile())) redirect({ href: "/forgot-password", locale });

  const t = await getTranslations("auth.resetPassword");
  return (
    <AuthShell title={t("title")} sub={t("sub")}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
