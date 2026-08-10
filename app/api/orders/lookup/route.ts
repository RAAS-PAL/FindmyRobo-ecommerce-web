import { NextResponse } from "next/server";
import { getOrderForLookup } from "@/lib/orderStore";
import { enforce, MINUTE } from "@/lib/rateLimit";

/**
 * Guest order lookup — order id + the email that placed it.
 *
 * Rate limited harder than the other routes because this is the one endpoint
 * where guessing is the attack: ids follow RP-YYYYMMDD-XXXX, so without a cap
 * someone could work through the keyspace for a given day. Ten attempts per
 * ten minutes makes that pointless while staying invisible to a real customer
 * mistyping their own order number.
 */
export async function POST(request: Request) {
  const limited = enforce(request, "order-lookup", 10, 10 * MINUTE);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!orderId || !email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const order = await getOrderForLookup(orderId, email);

    // One message for "no such order" and "wrong email" alike. Distinguishing
    // them would confirm that an order id exists, which is exactly the hint an
    // enumeration attempt is looking for.
    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        currency: order.currency,
        // Enough to recognise the delivery, without echoing the full address
        // back over an endpoint authenticated by a weak secret.
        shipping: {
          fullName: order.shipping.fullName,
          province: order.shipping.province,
        },
        ...(order.fulfillment
          ? {
              fulfillment: {
                status: order.fulfillment.status,
                trackingNumber: order.fulfillment.trackingNumber,
                carrier: order.fulfillment.carrier,
              },
            }
          : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
