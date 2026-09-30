"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const t = useTranslations("auth.account");
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className="flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-100 px-6 text-[13.5px] font-semibold text-content transition-colors hover:border-accent hover:text-accent-600"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {t("signOut")}
    </button>
  );
}
