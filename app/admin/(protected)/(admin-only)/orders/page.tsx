import Link from "next/link";
import { ChevronRight, Inbox, Package, Receipt, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { listOrders } from "@/lib/orderStore";
import { formatBaht } from "@/data/products";
import { getAdminLocale } from "@/lib/adminLocale";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderFulfillmentBadge from "@/components/admin/OrderFulfillmentBadge";
import type { OrderStatus } from "@/lib/checkout";

export const dynamic = "force-dynamic";

const FILTERS: (OrderStatus | "all")[] = [
  "all",
  "pending_payment",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

const itemCount = (items: { qty: number }[]) =>
  items.reduce((sum, item) => sum + item.qty, 0);

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status: statusParam }, locale] = await Promise.all([
    searchParams,
    getAdminLocale(),
  ]);
  const [orders, t] = await Promise.all([
    listOrders(),
    getTranslations({ locale, namespace: "admin.orders" }),
  ]);

  const active: OrderStatus | "all" =
    statusParam && FILTERS.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : "all";

  const counts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});
  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = counts.pending_payment ?? 0;

  const visible =
    active === "all" ? orders : orders.filter((o) => o.status === active);

  const fmtDate = (value: string) =>
    new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const filterHref = (f: OrderStatus | "all") =>
    f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`;

  return (
    <>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-content">
          {t("title")}
          <span className="ml-3 font-mono text-lg font-semibold text-ink-muted">
            {orders.length}
          </span>
        </h1>
      </div>

      {/* stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-forest-100 bg-surface p-5">
          <div className="flex items-center gap-2 text-ink-muted">
            <Wallet className="h-4 w-4 text-gold-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {t("stats.revenue")}
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-content">
            {formatBaht(revenue)}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            {t("stats.revenueNote", { count: paidOrders.length })}
          </p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-surface p-5">
          <div className="flex items-center gap-2 text-ink-muted">
            <Receipt className="h-4 w-4 text-gold-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {t("stats.total")}
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-content">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-surface p-5">
          <div className="flex items-center gap-2 text-ink-muted">
            <Package className="h-4 w-4 text-gold-600" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {t("stats.pending")}
            </span>
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums text-content">
            {pendingCount}
          </p>
          {pendingCount > 0 && (
            <p className="mt-1 text-[11px] text-ink-muted">{t("stats.pendingNote")}</p>
          )}
        </div>
      </div>

      {/* status filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : counts[f] ?? 0;
          const isActive = active === f;
          return (
            <Link
              key={f}
              href={filterHref(f)}
              className={`flex min-h-[38px] items-center gap-2 rounded-full border px-4 text-[12.5px] font-semibold transition-colors ${
                isActive
                  ? "border-gold bg-gold/15 text-gold-600"
                  : "border-forest-100 bg-surface text-ink-muted hover:border-gold/50 hover:text-content"
              }`}
            >
              {f === "all" ? t("filters.all") : t(`status.${f}`)}
              <span className="font-mono text-[11px] opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-forest-100 bg-surface">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Inbox className="h-8 w-8 text-forest-300" aria-hidden="true" />
            <p className="text-sm text-ink-muted">
              {orders.length === 0 ? t("empty") : t("emptyFiltered")}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-forest-100 bg-cloud font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">
                <th className="px-5 py-3 font-semibold">{t("table.order")}</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">
                  {t("table.date")}
                </th>
                <th className="hidden px-5 py-3 text-right font-semibold sm:table-cell">
                  {t("table.items")}
                </th>
                <th className="px-5 py-3 text-right font-semibold">{t("table.total")}</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">
                  {t("table.status")}
                </th>
                <th className="px-5 py-3">
                  <span className="sr-only">{t("table.view")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-100/70">
              {visible.map((order) => (
                <tr
                  key={order.id}
                  className="group transition-colors hover:bg-cloud/60"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="block"
                      aria-label={t("table.viewOrder", { id: order.id })}
                    >
                      <span className="block font-mono text-[12.5px] font-bold text-content group-hover:text-gold-600">
                        {order.id}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                        {order.shipping.fullName || t("guest")}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3.5 text-ink-muted md:table-cell">
                    {fmtDate(order.createdAt)}
                  </td>
                  <td className="hidden px-5 py-3.5 text-right font-mono tabular-nums text-ink-muted sm:table-cell">
                    {itemCount(order.items)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums text-content">
                    {formatBaht(order.total)}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <div className="flex flex-col items-start gap-1.5">
                      <OrderStatusBadge
                        status={order.status}
                        label={t(`status.${order.status}`)}
                      />
                      {order.fulfillment?.status && (
                        <OrderFulfillmentBadge
                          status={order.fulfillment.status}
                          label={t(`fulfillment.status.${order.fulfillment.status}`)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label={t("table.viewOrder", { id: order.id })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/15 hover:text-gold-600"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
