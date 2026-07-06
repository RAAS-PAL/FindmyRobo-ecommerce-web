"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
      className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-gold"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </button>
  );
}
