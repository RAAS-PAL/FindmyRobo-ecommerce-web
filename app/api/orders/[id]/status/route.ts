import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orderStore";

/**
 * Payment status for one order, polled by the return/QR pages while an async
 * method settles.
 *
 * Returns only the status and total — never shipping details or the full
 * record — because an order id is a weak secret (it appears in redirect URLs).
 * Guessing an id must reveal nothing useful.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    total: order.total,
  });
}
