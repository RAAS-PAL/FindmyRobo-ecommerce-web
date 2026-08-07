import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import AdminTabs from "@/components/admin/AdminTabs";
import { ThemeToggleButton } from "@/components/layout/ThemeToggle";
import { getAdminLocale } from "@/lib/adminLocale";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.navigation" });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image
                src="/main-logo-dark.png"
                alt="FindMyRobo"
                width={1200}
                height={320}
                className="h-7 w-auto"
              />
              <span className="hidden font-display text-base font-extrabold tracking-tight text-gold sm:inline">
                {t("adminLabel")}
              </span>
            </Link>
            <AdminTabs />
          </div>
          <div className="flex items-center gap-2">
            <a
              href={locale === "th" ? "/" : "/en"}
              target="_blank"
              rel="noreferrer"
              aria-label={t("viewStore")}
              title={t("viewStore")}
              className="flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-gold"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("viewStore")}</span>
            </a>
            <AdminLanguageSwitcher variant="dark" />
            <ThemeToggleButton
              variant="onDark"
              toDark={t("themeToDark")}
              toLight={t("themeToLight")}
            />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
