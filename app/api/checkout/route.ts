import { NextResponse, after } from "next/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/orderStore";
import { notifyNewOrder } from "@/lib/notifications";
import { getAllProducts } from "@/lib/productStore";
import {
  asShipping,
  makeOrderId,
  validateShipping,
  type CartItemInput,
  type OrderLine,
} from "@/lib/checkout";

const MAX_QTY_PER_LINE = 99;

/** Only ids and quantities are read from the request — prices come from the DB. */
function asCartItems(raw: unknown): CartItemInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const v = item as Record<string, unknown>;
    if (typeof v.id !== "string") return [];
    const qty = Math.floor(Number(v.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) return [];
    return [
      {
        id: v.id,
        qty,
        ...(typeof v.forId === "string" ? { forId: v.forId } : {}),
      },
    ];
  });
}

/**
 * Create an order. The cart lives in the browser and is therefore untrusted:
 * this route takes only product ids + quantities and rebuilds every line and
 * the total from the products table, so a tampered price cannot be paid.
 * The order is created `pending_payment`; the payment routes settle it.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const shipping = asShipping(body.shipping);
  const errors = validateShipping(shipping);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Invalid shipping details", errors }, { status: 400 });
  }

  const requested = asCartItems(body.items);
  if (requested.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Price every line from the catalog — the client's numbers are never read.
  const catalog = await getAllProducts();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const items: OrderLine[] = [];
  for (const item of requested) {
    const product = byId.get(item.id);
    if (!product) {
      return NextResponse.json(
        { error: `Product "${item.id}" is no longer available` },
        { status: 409 }
      );
    }
    const forProduct = item.forId ? byId.get(item.forId) : undefined;
    items.push({
      id: product.id,
      name: product.name,
      qty: item.qty,
      unitPrice: product.price,
      ...(forProduct ? { forId: forProduct.id, forName: forProduct.name } : {}),
    });
  }

  const subtotal = items.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  // Shipping/tax are confirmed by the team today, so total === subtotal for now.
  const total = subtotal;

  // Attach the order to the signed-in customer when there is one; guests are
  // still allowed to check out (user_id stays null).
  let userId: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {
    // auth unavailable — proceed as a guest order
  }

  // The confirmation email should be in the language the customer was
  // shopping in; fall back to the site default rather than guessing.
  const locale =
    typeof body.locale === "string" &&
    (routing.locales as readonly string[]).includes(body.locale)
      ? body.locale
      : routing.defaultLocale;

  try {
    const order = await createOrder({
      id: makeOrderId(),
      ...(userId ? { userId } : {}),
      shipping,
      items,
      subtotal,
      total,
    });

    // Runs after the response is sent, so the customer isn't kept waiting on
    // two email round-trips. `after` keeps the serverless function alive for
    // it — a bare floating promise would be killed once the response returns.
    after(() => notifyNewOrder(order, locale));

    return NextResponse.json(
      { orderId: order.id, total: order.total, items: order.items },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create order" },
      { status: 500 }
    );
  }
}
