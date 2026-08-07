import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: `${t("title")} — FindMyRobo` };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // already signed in → go to account
  if (await getProfile()) redirect({ href: "/account", locale });

  const t = await getTranslations("auth.login");
  return (
    <AuthShell title={t("title")} sub={t("sub")}>
      <LoginForm />
    </AuthShell>
  );
}
