import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });
  return { title: `${t("title")} — FindMyRobo`, alternates: pageAlternates(locale, "/forgot-password") };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("auth.forgotPassword");
  return (
    <AuthShell title={t("title")} sub={t("sub")}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
