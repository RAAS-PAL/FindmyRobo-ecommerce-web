import { redirect } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import { getAdminLocale } from "@/lib/adminLocale";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  const locale = await getAdminLocale();
  const t = await getTranslations({ locale, namespace: "admin.login" });

  return (
    <main className="relative flex flex-1 items-center justify-center px-4 py-20">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <AdminLanguageSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <Image
            src="/main-logo-light.png"
            alt="FindMyRobo"
            width={1200}
            height={320}
            className="h-8 w-auto dark:hidden"
          />
          <Image
            src="/main-logo-dark.png"
            alt="FindMyRobo"
            width={1200}
            height={320}
            className="hidden h-8 w-auto dark:block"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-accent-600">
            {t("adminLabel")}
          </span>
        </div>
        <div className="rounded-3xl border border-forest-100 bg-surface p-8 shadow-[0_16px_40px_-20px_rgba(10,46,31,0.25)]">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-muted">
          {t("staffOnly")}
        </p>
      </div>
    </main>
  );
}
