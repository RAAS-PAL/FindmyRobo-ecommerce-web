import { createServiceClient } from "@/lib/supabase/service";
import type {
  Order,
  OrderFulfillment,
  OrderLine,
  OrderPayment,
  OrderStatus,
  ShippingInfo,
} from "@/lib/checkout";

/**
 * Supabase-backed order store — the single read/write path for orders (see
 * supabase/orders-schema.sql). Mirrors lib/productStore.ts.
 *
 * Uses the service-role client (bypasses RLS) because orders are only ever
 * created/settled from trusted server contexts: the checkout API, the payment
 * routes, and the Omise webhook. A browser can never write an order.
 */

const TABLE = "orders";

/** Row shape as stored in Postgres — snake_case, matches orders-schema.sql. */
interface OrderRow {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  shipping: ShippingInfo;
  items: OrderLine[];
  subtotal: number;
  total: number;
  currency: string;
  payment: OrderPayment | null;
  fulfillment?: OrderFulfillment | null;
  created_at: string;
  updated_at?: string;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    ...(row.user_id ? { userId: row.user_id } : {}),
    status: row.status,
    shipping: row.shipping,
    items: row.items,
    subtotal: row.subtotal,
    total: row.total,
    currency: row.currency,
    ...(row.payment ? { payment: row.payment } : {}),
    ...(row.fulfillment ? { fulfillment: row.fulfillment } : {}),
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
  };
}

export async function createOrder(order: {
  id: string;
  userId?: string;
  shipping: ShippingInfo;
  items: OrderLine[];
  subtotal: number;
  total: number;
}): Promise<Order> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      id: order.id,
      user_id: order.userId ?? null,
      status: "pending_payment",
      shipping: order.shipping,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      currency: "THB",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to create order: ${error.message}`);
  return rowToOrder(data);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load order "${id}": ${error.message}`);
  return data ? rowToOrder(data) : undefined;
}

export async function listOrders(): Promise<Order[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return (data ?? []).map(rowToOrder);
}

/** Customer-facing order history, always scoped to the authenticated profile id. */
export async function listOrdersByUser(userId: string): Promise<Order[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load customer orders: ${error.message}`);
  return (data ?? []).map(rowToOrder);
}

/**
 * Manually set an order's status from the admin panel. This is the operations
 * lever for flows the payment webhook can't cover — chiefly "contact-to-pay"
 * orders that staff confirm after a bank transfer, and cancellations. It writes
 * only the status (the `payment` jsonb from the gateway is left intact) and is
 * gated behind isAdminAuthenticated() at the API route.
 */
export async function setOrderStatus(
  id: string,
  status: OrderStatus
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Failed to update order "${id}": ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/**
 * Merge fulfilment state into an order (never touches payment or `status`).
 * Written by the "Send to warehouse" action and by the Sokochan webhook; the
 * merge means a webhook update (tracking, shipped) preserves the sokochanOrderCode
 * recorded at send time, and vice versa.
 */
export async function setOrderFulfillment(
  id: string,
  patch: OrderFulfillment
): Promise<boolean> {
  const supabase = createServiceClient();
  const existing = await getOrderById(id);
  if (!existing) return false;

  const fulfillment: OrderFulfillment = {
    ...existing.fulfillment,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .update({ fulfillment })
    .eq("id", id)
    .select("id");
  if (error) {
    throw new Error(`Failed to update fulfilment for "${id}": ${error.message}`);
  }
  return (data?.length ?? 0) > 0;
}

/**
 * Settle an order's payment state. Written to be safe under webhook retries:
 * the same event applied twice lands on the same row values, and an order that
 * is already `paid` is never walked backwards by a late/duplicate event.
 */
export async function updateOrderPayment(
  id: string,
  status: OrderStatus,
  payment: OrderPayment
): Promise<boolean> {
  const supabase = createServiceClient();
  const existing = await getOrderById(id);
  if (!existing) return false;
  if (existing.status === "paid" && status !== "refunded") return true;

  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, payment: { ...existing.payment, ...payment } })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Failed to update order "${id}": ${error.message}`);
  return (data?.length ?? 0) > 0;
}
