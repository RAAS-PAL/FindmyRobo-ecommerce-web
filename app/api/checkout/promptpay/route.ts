import { NextResponse } from "next/server";
import { getOrderById, updateOrderPayment } from "@/lib/orderStore";
import {
  chargeToOrderStatus,
  createSource,
  createSourceCharge,
  omiseConfigured,
  scannableQrUri,
  toSatang,
} from "@/lib/omise";
import { paymentReturnUrl } from "@/lib/paymentReturn";

/**
 * Start a PromptPay payment for an order.
 *
 * PromptPay is asynchronous: we create a source, charge it, and hand the
 * customer a QR to scan in their banking app. Nothing here proves payment — the
 * charge stays `pending` until the bank confirms, and the **webhook** is what
 * actually settles the order. The client polls /api/orders/[id]/status purely
 * so the UI can react; closing the tab mid-scan still settles correctly.
 *
 * As with cards, the amount comes from the stored order, never the request.
 */
export async function POST(request: Request) {
  if (!omiseConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet (OMISE_SECRET_KEY missing)." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const locale = typeof body.locale === "string" ? body.locale : undefined;
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ status: "paid", orderId: order.id });
  }
  if (order.status !== "pending_payment") {
    return NextResponse.json(
      { error: `Order is ${order.status} and can no longer be paid` },
      { status: 409 }
    );
  }

  const amount = toSatang(order.total);

  try {
    const source = await createSource({ type: "promptpay", amount });
    const charge = await createSourceCharge({
      amount,
      sourceId: source.id,
      orderId: order.id,
      returnUri: paymentReturnUrl(request, order.id, locale),
      description: `RoboStore TH ${order.id}`,
    });

    const qrImage = scannableQrUri(charge);

    // Record the attempt so the return page and admin can trace it. Status is
    // whatever Omise reports — normally still pending until the QR is scanned.
    await updateOrderPayment(order.id, chargeToOrderStatus(charge), {
      method: "promptpay",
      chargeId: charge.id,
      sourceId: source.id,
      ...(charge.failure_message ? { failureMessage: charge.failure_message } : {}),
    });

    if (!qrImage) {
      // Charge exists but Omise returned no scannable code — surface it rather
      // than showing an empty box the customer can't act on.
      return NextResponse.json(
        { error: "PromptPay QR was not returned by the payment provider." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: chargeToOrderStatus(charge),
      orderId: order.id,
      chargeId: charge.id,
      qrImage,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PromptPay charge failed";
    await updateOrderPayment(order.id, "failed", {
      method: "promptpay",
      failureMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 402 });
  }
}
