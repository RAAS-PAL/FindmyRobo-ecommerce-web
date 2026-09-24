"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutTemplate, Package, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StaffRole } from "@/lib/adminAuth";

/**
 * Primary section nav for the admin panel. Admin routes are not locale-prefixed,
 * so the pathname is matched directly. Products owns the dashboard root and all
 * /admin/products/* sub-pages; Orders owns /admin/orders/*; Content owns
 * /admin/content/*.
 *
 * The marketing role sees only Content. Hiding the other tabs is presentation —
 * the pages and API routes behind them check the role on their own.
 */
export default function AdminTabs({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const t = useTranslations("admin.navigation");

  const onOrders = pathname.startsWith("/admin/orders");
  const onContent = pathname.startsWith("/admin/content");
  const tabs = [
    { key: "products", href: "/admin", icon: Package, active: !onOrders && !onContent, adminOnly: true },
    { key: "orders", href: "/admin/orders", icon: Receipt, active: onOrders, adminOnly: true },
    { key: "content", href: "/admin/content", icon: LayoutTemplate, active: onContent, adminOnly: false },
  ] as const;

  return (
    <nav className="flex items-center gap-1" aria-label={t("sections")}>
      {tabs
        .filter((tab) => role === "admin" || !tab.adminOnly)
        .map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={`flex min-h-[38px] items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors sm:px-4 ${
                tab.active
                  ? "bg-white/10 text-gold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t(`tabs.${tab.key}`)}</span>
            </Link>
          );
        })}
    </nav>
  );
}
