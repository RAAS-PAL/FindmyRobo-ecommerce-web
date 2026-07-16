import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FadeIn from "@/components/ui/FadeIn";
import PaymentResult from "@/components/checkout/PaymentResult";
import { getOrderById, updateOrderPayment } from "@/lib/orderStore";
import { getCharge, omiseConfigured } from "@/lib/omise";
import { chargeToOrderStatus } from "@/app/api/checkout/pay/route";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payment" });
  return { title: t("heading"), robots: { index: false, follow: false } };
}

/**
 * Where the bank/wallet sends the customer back after a redirect payment.
 *
 * Coming back here proves nothing about payment, so we re-read the charge from
 * Omise and settle the order from that. The webhook does the same job
 * independently — whichever arrives first wins, and the update is idempotent,
 * so a customer who closes the tab still gets a correctly settled order.
 */
export default async function PaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { order: orderId } = await searchParams;
  const t = await getTranslations("payment");

  const order = orderId ? await getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <main className="bg-cloud">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-ink-muted">{t("result.notFound")}</p>
        </div>
      </main>
    );
  }

  // Settle from Omise directly rather than trusting the redirect.
  let status = order.status;
  if (status === "pending_payment" && order.payment?.chargeId && omiseConfigured()) {
    try {
      const charge = await getCharge(order.payment.chargeId);
      status = chargeToOrderStatus(charge);
      if (status !== order.status) {
        await updateOrderPayment(order.id, status, {
          ...order.payment,
          ...(charge.failure_message ? { failureMessage: charge.failure_message } : {}),
        });
      }
    } catch {
      // couldn't reach Omise — the webhook will settle it; poll meanwhile
    }
  }

  return (
    <main className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <PaymentResult orderId={order.id} initialStatus={status} />
        </FadeIn>
      </div>
    </main>
  );
}
