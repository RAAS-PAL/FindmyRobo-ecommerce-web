import { NextResponse } from "next/server";
import { getOrderById, setOrderFulfillment } from "@/lib/orderStore";
import type { OrderFulfillment } from "@/lib/checkout";

/**
 * Sokochan shipping webhook — updates an order's fulfilment state as it moves
 * through the warehouse (picked → packed → shipped) or is cancelled.
 *
 * TRUST MODEL: Sokochan does not document a signature, so the body is treated as
 * untrusted. Two guards contain the blast radius:
 *  1. An optional shared secret in the URL (`?token=`) — set SOKOCHAN_WEBHOOK_SECRET
 *     and register the webhook as .../api/webhooks/sokochan?token=SECRET. A wrong
 *     or missing token is rejected.
 *  2. It only ever writes FULFILMENT fields on an order we already have; it can
 *     never touch payment or money state. Worst case a forged call sets a wrong
 *     tracking number on a known order id.
 *
 * Idempotent: re-applying the same event lands on the same fulfilment values.
 * Unknown external_id returns 200 so Sokochan stops retrying.
 */

/** Sokochan event name -> our fulfilment status. */
function eventToStatus(event: string): OrderFulfillment["status"] | null {
  switch (event) {
    case "order.picked":
      return "picked";
    case "order.packed":
      return "packed";
    case "order.shipped":
    case "order.shipment.updated":
      return "shipped";
    case "order.cancelled":
      return "cancelled";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  // Shared-secret gate (only enforced when the secret is configured).
  const secret = process.env.SOKOCHAN_WEBHOOK_SECRET;
  if (secret) {
    const token = new URL(request.url).searchParams.get("token");
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventName = typeof event.event === "string" ? event.event : "";
  const data = (event.data ?? {}) as Record<string, unknown>;
  const externalId = typeof data.external_id === "string" ? data.external_id : "";

  const status = eventToStatus(eventName);
  if (!status || !externalId) {
    // Not a fulfilment event we track, or no id — accept so Sokochan stops retrying.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const order = await getOrderById(externalId);
  if (!order) {
    return NextResponse.json({ ok: true, ignored: "unknown order" });
  }

  const patch: OrderFulfillment = {
    status,
    ...(typeof data.tracking_number === "string" && data.tracking_number
      ? { trackingNumber: data.tracking_number }
      : {}),
    ...(typeof data.shipping === "string" && data.shipping
      ? { carrier: data.shipping }
      : {}),
    ...(typeof data.order_code === "string" && data.order_code
      ? { sokochanOrderCode: data.order_code }
      : {}),
  };

  try {
    await setOrderFulfillment(externalId, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    // 500 so Sokochan retries — a transient DB blip must not lose a shipment update.
    console.error("Sokochan webhook failed:", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
