import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getOrderById } from "@/lib/orderStore";
import { formatBaht } from "@/data/products";
import { getAdminLocale } from "@/lib/adminLocale";
import { sokochanConfigured } from "@/lib/sokochan";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import OrderFulfillmentBadge from "@/components/admin/OrderFulfillmentBadge";
import FulfillmentPanel from "@/components/admin/FulfillmentPanel";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, locale] = await Promise.all([params, getAdminLocale()]);
  const [order, t] = await Promise.all([
    getOrderById(id),
    getTranslations({ locale, namespace: "admin.orders" }),
  ]);

  if (!order) notFound();

  const fmtDateTime = (value: string) =>
    new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  const { shipping, payment, fulfillment } = order;
  const hasPayment =
    payment &&
    (payment.method || payment.chargeId || payment.sourceId || payment.failureMessage);
  const fulfillmentConfigured = sokochanConfigured();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/orders"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink-muted transition-colors hover:text-accent-600"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("detail.back")}
      </Link>

      {/* header */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-600">
            {t("detail.eyebrow")}
          </p>
          <h1 className="mt-2 font-mono text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
            {order.id}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {t("detail.placedOn", { date: fmtDateTime(order.createdAt) })}
          </p>
        </div>
        <OrderStatusBadge
          status={order.status}
          label={t(`status.${order.status}`)}
          className="mt-1 text-[11px]"
        />
      </div>

      {/* status control */}
      <section className="mt-6 rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-content">
          {t("control.heading")}
        </h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {t("control.help")}
        </p>
        <div className="mt-4">
          <OrderStatusControl orderId={order.id} current={order.status} />
        </div>
      </section>

      {/* fulfilment (Sokochan) */}
      <section className="mt-6 rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-content">
            {t("fulfillment.heading")}
          </h2>
          {fulfillment?.status && (
            <OrderFulfillmentBadge
              status={fulfillment.status}
              label={t(`fulfillment.status.${fulfillment.status}`)}
            />
          )}
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {t("fulfillment.help")}
        </p>
        <div className="mt-4">
          <FulfillmentPanel
            orderId={order.id}
            paid={order.status === "paid"}
            configured={fulfillmentConfigured}
            fulfillment={fulfillment}
          />
        </div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* items */}
        <section className="overflow-hidden rounded-2xl border border-forest-100 bg-surface">
          <div className="border-b border-forest-100 px-5 py-4">
            <h2 className="font-display text-base font-bold text-content">
              {t("detail.itemsHeading")}
            </h2>
          </div>
          <ul className="divide-y divide-forest-100/70">
            {order.items.map((item, index) => (
              <li
                key={`${item.id}-${item.forId ?? ""}-${index}`}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-content">{item.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-muted">{item.id}</p>
                  {item.forName && (
                    <p className="mt-1 text-[12px] text-ink-muted">
                      {t("detail.forProduct", { name: item.forName })}
                    </p>
                  )}
                  <p className="mt-1 text-[12.5px] text-ink-muted">
                    {formatBaht(item.unitPrice)} × {item.qty}
                  </p>
                </div>
                <p className="shrink-0 font-mono font-semibold tabular-nums text-content">
                  {formatBaht(item.unitPrice * item.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-forest-100 bg-cloud/40 px-5 py-4">
            <div className="flex justify-between text-[13px] text-ink-muted">
              <span>{t("detail.subtotal")}</span>
              <span className="font-mono tabular-nums">{formatBaht(order.subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-forest-100 pt-2 text-base font-bold text-content">
              <span>{t("detail.total")}</span>
              <span className="font-mono tabular-nums">{formatBaht(order.total)}</span>
            </div>
          </div>
        </section>

        {/* customer + shipping + payment */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-content">
              <User className="h-4 w-4 text-accent-600" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">{t("detail.customer")}</h2>
            </div>
            <p className="mt-3 font-semibold text-content">
              {shipping.fullName || t("guest")}
            </p>
            <div className="mt-3 space-y-2 text-[13px]">
              {shipping.email && (
                <a
                  href={`mailto:${shipping.email}`}
                  className="flex items-center gap-2 text-ink-muted transition-colors hover:text-accent-600"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{shipping.email}</span>
                </a>
              )}
              {shipping.phone && (
                <a
                  href={`tel:${shipping.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-ink-muted transition-colors hover:text-accent-600"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {shipping.phone}
                </a>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-content">
              <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">{t("detail.shipping")}</h2>
            </div>
            <address className="mt-3 text-[13px] not-italic leading-relaxed text-ink-muted">
              {shipping.address}
              <br />
              {shipping.district}, {shipping.province} {shipping.postalCode}
            </address>
            {shipping.note && (
              <p className="mt-3 rounded-lg bg-cloud/60 px-3 py-2 text-[12.5px] text-ink-muted">
                <span className="font-semibold text-content">{t("detail.note")}: </span>
                {shipping.note}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-content">
              <CreditCard className="h-4 w-4 text-accent-600" aria-hidden="true" />
              <h2 className="font-display text-base font-bold">{t("detail.payment")}</h2>
            </div>
            {hasPayment ? (
              <dl className="mt-3 space-y-2.5 text-[13px]">
                {payment?.method && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">{t("detail.method")}</dt>
                    <dd className="font-semibold text-content">{payment.method}</dd>
                  </div>
                )}
                {payment?.chargeId && (
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-muted">{t("detail.chargeId")}</dt>
                    <dd className="truncate font-mono text-[12px] text-content">
                      {payment.chargeId}
                    </dd>
                  </div>
                )}
                {payment?.sourceId && (
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-muted">{t("detail.sourceId")}</dt>
                    <dd className="truncate font-mono text-[12px] text-content">
                      {payment.sourceId}
                    </dd>
                  </div>
                )}
                {payment?.failureMessage && (
                  <div className="rounded-lg bg-red-500/10 px-3 py-2 text-[12.5px] text-red-600">
                    {payment.failureMessage}
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted">{t("detail.noPayment")}</p>
            )}
            <p className="mt-4 border-t border-forest-100 pt-3 text-[11.5px] text-ink-muted">
              {t("detail.updatedAt", {
                date: fmtDateTime(order.updatedAt ?? order.createdAt),
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
