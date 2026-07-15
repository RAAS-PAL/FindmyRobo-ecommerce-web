import { redirect } from "next/navigation";
import { Bot } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-950 text-gold">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-content">
            RoboStore TH <span className="text-gold-600">Admin</span>
          </span>
        </div>
        <div className="rounded-3xl border border-forest-100 bg-surface p-8 shadow-[0_16px_40px_-20px_rgba(10,46,31,0.25)]">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-muted">
          Staff access only. Sign in with your admin account.
        </p>
      </div>
    </main>
  );
}
