import { NextResponse } from "next/server";
import { getOrderById, updateOrderPayment } from "@/lib/orderStore";
import { getCharge, omiseConfigured } from "@/lib/omise";
import { chargeToOrderStatus } from "@/app/api/checkout/pay/route";

/**
 * Omise webhook — the source of truth for payment state.
 *
 * Why this exists: PromptPay, wallets, installments and 3-D Secure cards all
 * settle asynchronously. The customer may close the tab mid-payment, so the
 * browser can never be relied on to tell us an order was paid.
 *
 * TRUST MODEL: Omise does not sign webhooks, so the request body is treated as
 * a rumour — we take only the charge id from it and re-read the real charge
 * from the Omise API before touching an order. A forged POST therefore can't
 * mark anything paid: it would have to name a charge id that Omise itself
 * reports as successful.
 *
 * Idempotent by construction: retries and out-of-order deliveries re-apply the
 * same derived state, and updateOrderPayment refuses to walk a paid order back.
 */
export async function POST(request: Request) {
  if (!omiseConfigured()) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  let event: Record<string, unknown>;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data = (event.data ?? {}) as Record<string, unknown>;
  const isCharge = data.object === "charge" && typeof data.id === "string";
  if (!isCharge) {
    // Not a charge event (transfer, refund, …) — accept so Omise stops retrying.
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    // Re-read from Omise; never trust the posted body.
    const charge = await getCharge(data.id as string);

    const orderId =
      typeof charge.metadata?.orderId === "string" ? charge.metadata.orderId : null;
    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: "no orderId in metadata" });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ ok: true, ignored: "unknown order" });
    }

    // Guard against a charge whose amount doesn't match the order it claims.
    if (charge.amount !== order.total * 100) {
      console.error(
        `Webhook amount mismatch for ${orderId}: charge ${charge.amount} vs order ${order.total * 100}`
      );
      return NextResponse.json({ ok: true, ignored: "amount mismatch" });
    }

    await updateOrderPayment(orderId, chargeToOrderStatus(charge), {
      method: charge.source?.type ?? "card",
      chargeId: charge.id,
      ...(charge.source?.id ? { sourceId: charge.source.id } : {}),
      ...(charge.failure_message ? { failureMessage: charge.failure_message } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    // 500 so Omise retries — a transient Omise/DB blip must not lose a payment.
    console.error("Omise webhook failed:", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
