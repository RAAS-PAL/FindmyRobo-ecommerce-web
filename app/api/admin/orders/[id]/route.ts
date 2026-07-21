import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { setOrderStatus } from "@/lib/orderStore";
import type { OrderStatus } from "@/lib/checkout";

const ALLOWED: OrderStatus[] = [
  "pending_payment",
  "paid",
  "failed",
  "expired",
  "cancelled",
  "refunded",
];

/** Manual status change from the admin order detail view. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !ALLOWED.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const updated = await setOrderStatus(id, status as OrderStatus);
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  revalidatePath("/admin/orders", "layout");
  return NextResponse.json({ ok: true, id, status });
}
