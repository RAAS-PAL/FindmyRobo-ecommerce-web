import { NextResponse } from "next/server";
import { getOrderById, updateOrderPayment } from "@/lib/orderStore";
import {
  createCardCharge,
  omiseConfigured,
  toSatang,
  type OmiseCharge,
} from "@/lib/omise";
import type { OrderStatus } from "@/lib/checkout";

/**
 * Pay an order with a card token.
 *
 * The browser tokenizes the card with Omise.js and sends only the token — raw
 * card details never reach this server (PCI SAQ-A). The amount charged is read
 * from the stored order, so a tampered request can't change what is charged.
 */

/** Omise charge status -> our order status. */
export function chargeToOrderStatus(charge: OmiseCharge): OrderStatus {
  if (charge.paid || charge.status === "successful") return "paid";
  if (charge.status === "failed" || charge.status === "reversed") return "failed";
  if (charge.status === "expired") return "expired";
  return "pending_payment"; // includes 3-D Secure / redirect in progress
}

function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

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
      returnUri: `${siteOrigin(request)}/en/checkout/return?order=${encodeURIComponent(order.id)}`,
      description: `RoboStore TH ${order.id}`,
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
