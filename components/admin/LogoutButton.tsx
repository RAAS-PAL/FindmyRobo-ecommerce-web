"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("admin.navigation");
  const supabase = createClient();
  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      aria-label={t("signOut")}
      title={t("signOut")}
      className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-accent-300"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{t("signOut")}</span>
    </button>
  );
}
