import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signup" });
  return { title: `${t("title")} — RoboMart TH` };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await getProfile()) redirect({ href: "/account", locale });

  const t = await getTranslations("auth.signup");
  return (
    <AuthShell title={t("title")} sub={t("sub")}>
      <SignupForm />
    </AuthShell>
  );
}
