import type { Metadata } from "next";
import NextLink from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin, PackageCheck, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth";
import { listOwnAddresses } from "@/lib/addressStore";
import { listOrdersByUser } from "@/lib/orderStore";
import { getAllProducts } from "@/lib/productStore";
import { formatBaht } from "@/data/products";
import FadeIn from "@/components/ui/FadeIn";
import SignOutButton from "@/components/auth/SignOutButton";
import AddressManager from "@/components/account/AddressManager";
import AccountHistory, { type PurchaseHistoryItem } from "@/components/account/AccountHistory";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.account" });
  return { title: `${t("title")} — RoboMart TH` };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getProfile();
  if (!profile) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [addressResult, orders, catalog] = await Promise.all([
    listOwnAddresses(),
    listOrdersByUser(profile.id),
    getAllProducts(),
  ]);
  const t = await getTranslations("auth.account");
  const displayName = profile.full_name || profile.email || "";
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const isAdmin = profile.role === "admin";
  const paidOrders = orders.filter((order) => order.status === "paid");
  const totalSpent = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const catalogById = new Map(catalog.map((product) => [product.id, product]));

  const purchaseMap = new Map<string, PurchaseHistoryItem>();
  for (const order of orders.filter((item) =>
    item.status === "paid" || item.status === "refunded"
  )) {
    for (const line of order.items) {
      const key = `${line.id}:${line.forId ?? ""}`;
      const existing = purchaseMap.get(key);
      if (existing) {
        existing.totalQty += line.qty;
      } else {
        purchaseMap.set(key, {
          ...line,
          totalQty: line.qty,
          lastPurchasedAt: order.createdAt,
          product: catalogById.get(line.id),
        });
      }
    }
  }
  const purchases = [...purchaseMap.values()].slice(0, 9);

  return (
    <main className="flex-1 bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <FadeIn>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-950 text-gold">
                <UserRound className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  {t("title")}
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-content sm:text-4xl">
                  {t("greeting", { name: displayName })}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAdmin && (
                <NextLink
                  href="/admin"
                  className="flex min-h-[46px] items-center gap-2 rounded-full bg-forest-950 px-5 text-[13px] font-bold text-gold transition-colors hover:bg-forest-900"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {t("adminLink")}
                </NextLink>
              )}
              <SignOutButton />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.06}>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-forest-100 bg-surface p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-600">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xl font-bold text-content">{addressResult.addresses.length}</p>
                <p className="text-xs text-ink-muted">{t("savedAddresses")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-forest-100 bg-surface p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-600">
                <PackageCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xl font-bold text-content">{paidOrders.length}</p>
                <p className="text-xs text-ink-muted">{t("completedOrders")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-forest-100 bg-surface p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-600">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-xl font-bold text-content">{formatBaht(totalSpent)}</p>
                <p className="text-xs text-ink-muted">{t("totalSpent")}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <section aria-labelledby="profile-heading" className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
                  {t("profileEyebrow")}
                </p>
                <h2 id="profile-heading" className="mt-1 font-display text-xl font-extrabold text-content">
                  {t("profileHeading")}
                </h2>
                <dl className="mt-5 divide-y divide-forest-100">
                  <div className="flex justify-between gap-4 py-3 first:pt-0">
                    <dt className="text-xs text-ink-muted">{t("email")}</dt>
                    <dd className="truncate text-right text-sm font-semibold text-content">{profile.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-xs text-ink-muted">{t("role")}</dt>
                    <dd className="text-sm font-semibold text-content">{isAdmin ? t("roleAdmin") : t("roleUser")}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3 last:pb-0">
                    <dt className="text-xs text-ink-muted">{t("memberSince")}</dt>
                    <dd className="text-right text-sm font-semibold text-content">{memberSince}</dd>
                  </div>
                </dl>
              </section>
            </FadeIn>
            <FadeIn delay={0.14}>
              <AddressManager
                initialAddresses={addressResult.addresses}
                setupRequired={addressResult.setupRequired}
                profileEmail={profile.email ?? ""}
                profileName={profile.full_name ?? ""}
              />
            </FadeIn>
          </div>

          <FadeIn delay={0.12}>
            <AccountHistory orders={orders} purchases={purchases} />
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
