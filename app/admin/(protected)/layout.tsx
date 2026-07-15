import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import LogoutButton from "@/components/admin/LogoutButton";
import { ThemeToggleButton } from "@/components/layout/ThemeToggle";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-forest-950">
              <Bot className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-white">
              RoboStore TH <span className="text-gold">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="/en"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[40px] items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-gold"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View store
            </a>
            {/* admin is English-only, so the labels are plain strings */}
            <ThemeToggleButton
              variant="onDark"
              toDark="Switch to dark mode"
              toLight="Switch to light mode"
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
