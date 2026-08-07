import { NextResponse } from "next/server";
import { getOrderById, updateOrderPayment } from "@/lib/orderStore";
import {
  chargeToOrderStatus,
  createCardCharge,
  omiseConfigured,
  toSatang,
  type OmiseCharge,
} from "@/lib/omise";
import { paymentReturnUrl } from "@/lib/paymentReturn";

/**
 * Pay an order with a card token.
 *
 * The browser tokenizes the card with Omise.js and sends only the token — raw
 * card details never reach this server (PCI SAQ-A). The amount charged is read
 * from the stored order, so a tampered request can't change what is charged.
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
  const token = typeof body.token === "string" ? body.token : "";
  // Locale is only used to build the return URL; paymentReturnUrl falls back to
  // the default locale if it is missing or not one we serve.
  const locale = typeof body.locale === "string" ? body.locale : undefined;
  if (!orderId || !token) {
    return NextResponse.json({ error: "orderId and token are required" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Never charge twice for the same order.
  if (order.status === "paid") {
    return NextResponse.json({ status: "paid", orderId: order.id });
  }
  if (order.status !== "pending_payment") {
    return NextResponse.json(
      { error: `Order is ${order.status} and can no longer be paid` },
      { status: 409 }
    );
  }

  let charge: OmiseCharge;
  try {
    charge = await createCardCharge({
      // amount comes from the ORDER, not the request
      amount: toSatang(order.total),
      token,
      orderId: order.id,
      returnUri: paymentReturnUrl(request, order.id, locale),
      description: `FindMyRobo ${order.id}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Charge failed";
    await updateOrderPayment(order.id, "failed", {
      method: "card",
      failureMessage: message,
    });
    return NextResponse.json({ error: message }, { status: 402 });
  }

  const status = chargeToOrderStatus(charge);
  await updateOrderPayment(order.id, status, {
    method: "card",
    chargeId: charge.id,
    ...(charge.failure_message ? { failureMessage: charge.failure_message } : {}),
  });

  // 3-D Secure: the customer must visit their bank before this completes. The
  // webhook is what ultimately settles the order — the redirect back is only UI.
  if (charge.authorize_uri && !charge.paid) {
    return NextResponse.json({ status: "redirect", authorizeUri: charge.authorize_uri });
  }

  return NextResponse.json({
    status,
    orderId: order.id,
    ...(charge.failure_message ? { error: charge.failure_message } : {}),
  });
}
