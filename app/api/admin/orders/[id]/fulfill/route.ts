import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getOrderById, setOrderFulfillment } from "@/lib/orderStore";
import { getAllProductsForAdmin } from "@/lib/productStore";
import {
  createFulfillmentOrder,
  sokochanConfigured,
  SHIPPING_CARRIERS,
  type SokochanOrderItem,
} from "@/lib/sokochan";
import { SERVICE_CATEGORY } from "@/data/products";
import type { ShippingCarrier } from "@/lib/checkout";

const CARRIER_CODES = SHIPPING_CARRIERS.map((c) => c.code) as ShippingCarrier[];

/**
 * "Send to warehouse" — push a paid order to Sokochan for fulfilment.
 *
 * Manual by design (admin-triggered), so high-value and preorder items never
 * ship without a human. Idempotent: an order already sent returns its existing
 * Sokochan code rather than creating a duplicate. Only physical robots are sent
 * — service lines (installation/demo) are dropped, and any shippable line
 * missing a SKU blocks the send with the product named.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!sokochanConfigured()) {
    return NextResponse.json(
      { error: "Fulfilment is not configured yet (Sokochan credentials missing)." },
      { status: 503 }
    );
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const carrier = body.carrier as ShippingCarrier;
  if (!CARRIER_CODES.includes(carrier)) {
    return NextResponse.json({ error: "Invalid carrier" }, { status: 400 });
  }

  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Only paid orders can be sent to the warehouse." },
      { status: 409 }
    );
  }
  // Already sent — return the existing code, never create a duplicate.
  if (order.fulfillment?.sokochanOrderCode) {
    return NextResponse.json({
      ok: true,
      alreadySent: true,
      orderCode: order.fulfillment.sokochanOrderCode,
    });
  }

  // Resolve each line's product to get its SKU + category. Admin catalog so a
  // since-hidden product is still fulfillable.
  const catalog = await getAllProductsForAdmin();
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const items: SokochanOrderItem[] = [];
  const missingSku: string[] = [];
  for (const line of order.items) {
    const product = byId.get(line.id);
    // Services aren't shipped; skip them entirely.
    if (product?.category === SERVICE_CATEGORY) continue;
    const sku = product?.sku?.trim();
    if (!sku) {
      missingSku.push(line.name);
      continue;
    }
    items.push({ item_sku: sku, item_qty: line.qty });
  }

  if (missingSku.length > 0) {
    return NextResponse.json(
      {
        error: `Set a warehouse SKU before shipping: ${missingSku.join(", ")}`,
        missingSku,
      },
      { status: 400 }
    );
  }
  if (items.length === 0) {
    return NextResponse.json(
      { error: "This order has no shippable products (services only)." },
      { status: 400 }
    );
  }

  const s = order.shipping;
  try {
    const result = await createFulfillmentOrder({
      external_id: order.id,
      order_number: order.id,
      shipping: carrier,
      ...(s.note ? { comment: s.note.slice(0, 50) } : {}),
      customer: {
        name: s.fullName,
        address: s.address,
        ...(s.district ? { district: s.district } : {}),
        province: s.province,
        postal_code: s.postalCode,
        ...(s.phone ? { mobile_no: s.phone } : {}),
        ...(s.email ? { email: s.email } : {}),
      },
      order_items: items,
    });

    await setOrderFulfillment(order.id, {
      sokochanOrderCode: result.order_code,
      carrier,
      status: "created",
      error: undefined,
    });
    revalidatePath("/admin/orders", "layout");
    return NextResponse.json({ ok: true, orderCode: result.order_code });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fulfilment request failed";
    // Record the failure so the admin sees why, but keep the order paid.
    await setOrderFulfillment(order.id, { carrier, error: message });
    revalidatePath("/admin/orders", "layout");
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
