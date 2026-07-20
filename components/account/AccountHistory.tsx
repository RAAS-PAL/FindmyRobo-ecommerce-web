"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Clock3, PackageCheck, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ProductVisual from "@/components/ui/ProductVisual";
import { formatBaht, type Product } from "@/data/products";
import type { Order, OrderLine, OrderStatus } from "@/lib/checkout";

export interface PurchaseHistoryItem extends OrderLine {
  totalQty: number;
  lastPurchasedAt: string;
  product?: Product;
}

const statusClass: Record<OrderStatus, string> = {
  pending_payment: "bg-gold/20 text-gold-600",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-blue-100 text-blue-700",
};

export default function AccountHistory({
  orders,
  purchases,
}: {
  orders: Order[];
  purchases: PurchaseHistoryItem[];
}) {
  const t = useTranslations("auth.account");
  const locale = useLocale();
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));

  return (
    <>
      <section aria-labelledby="orders-heading" className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
          {t("transactions")}
        </p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <div>
            <h2 id="orders-heading" className="font-display text-xl font-extrabold text-content">
              {t("ordersHeading")}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{t("ordersSub")}</p>
          </div>
          <span className="font-mono text-sm font-bold text-content">{orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-forest-100 px-6 py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-gold-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-content">{t("noOrders")}</p>
            <p className="mt-1 text-xs text-ink-muted">{t("noOrdersSub")}</p>
            <Link href="/shop" className="mt-4 flex min-h-11 items-center rounded-full bg-gold px-5 text-xs font-bold text-forest-950">
              {t("shopNow")}
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {orders.map((order) => (
              <details key={order.id} className="group rounded-xl border border-forest-100 bg-cloud/45 open:bg-cloud/70">
                <summary className="flex min-h-[76px] cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-gold-600">
                    <PackageCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs font-bold text-content">{order.id}</span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      {date(order.createdAt)} · {t("itemCount", { count: order.items.reduce((sum, item) => sum + item.qty, 0) })}
                    </span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${statusClass[order.status]}`}>
                      {t(`status.${order.status}`)}
                    </span>
                    <span className="mt-2 block font-mono text-sm font-bold text-content">{formatBaht(order.total)}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="border-t border-forest-100 px-4 py-4">
                  <div className="mb-4 flex items-center justify-between sm:hidden">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${statusClass[order.status]}`}>
                      {t(`status.${order.status}`)}
                    </span>
                    <span className="font-mono text-sm font-bold text-content">{formatBaht(order.total)}</span>
                  </div>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={`${item.id}-${item.forId ?? ""}-${index}`} className="flex justify-between gap-4 text-xs">
                        <span className="text-content">
                          {item.name} <span className="text-ink-muted">× {item.qty}</span>
                          {item.forName && <span className="mt-0.5 block text-[11px] text-ink-muted">{t("forProduct", { name: item.forName })}</span>}
                        </span>
                        <span className="shrink-0 font-mono font-semibold text-content">{formatBaht(item.unitPrice * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid gap-3 border-t border-forest-100 pt-4 text-xs sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-content">{t("deliveryAddress")}</p>
                      <address className="mt-1 not-italic leading-relaxed text-ink-muted">
                        {order.shipping.fullName}<br />
                        {order.shipping.address}, {order.shipping.district}<br />
                        {order.shipping.province} {order.shipping.postalCode}
                      </address>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-ink-muted">{t("orderTotal")}</p>
                      <p className="mt-1 font-mono text-lg font-bold text-content">{formatBaht(order.total)}</p>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="history-heading" className="mt-6 rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
          {t("yourRobots")}
        </p>
        <h2 id="history-heading" className="mt-1 font-display text-xl font-extrabold text-content">
          {t("historyHeading")}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t("historySub")}</p>

        {purchases.length === 0 ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-forest-100 p-5">
            <Clock3 className="h-6 w-6 shrink-0 text-gold-600" aria-hidden="true" />
            <p className="text-sm text-ink-muted">{t("noHistory")}</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {purchases.map((item) => (
              <article key={`${item.id}-${item.forId ?? ""}`} className="flex gap-3 rounded-xl border border-forest-100 bg-cloud/45 p-3">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface p-1">
                  {item.product ? (
                    <ProductVisual product={item.product} className="h-full w-full" />
                  ) : (
                    <ShoppingBag className="h-7 w-7 text-forest-300" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug text-content">{item.name}</h3>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {t("lastPurchased", { date: date(item.lastPurchasedAt) })}
                  </p>
                  <p className="mt-1 font-mono text-xs font-semibold text-content">
                    {t("purchasedQty", { count: item.totalQty })}
                  </p>
                  {item.product && (
                    <Link href={`/products/${item.product.id}`} className="mt-2 inline-flex text-xs font-bold text-gold-600 hover:text-content">
                      {t("viewProduct")} →
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
