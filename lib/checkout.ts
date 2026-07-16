/**
 * Checkout types + shipping validation shared by the browser form and the
 * server. The client validates for fast feedback; the server validates again
 * because a request can arrive without ever touching our form.
 */

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  note: string;
}

export type ShippingField = keyof ShippingInfo;

export const EMPTY_SHIPPING: ShippingInfo = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
  note: "",
};

/** What the browser sends: ids + quantities only — never prices. */
export interface CartItemInput {
  id: string;
  qty: number;
  /** For service lines: the robot product this service is attached to. */
  forId?: string;
}

/** A priced line, resolved server-side from the products table. */
export interface OrderLine {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  forId?: string;
  forName?: string;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

export interface OrderPayment {
  method?: string;
  chargeId?: string;
  sourceId?: string;
  failureMessage?: string;
}

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  shipping: ShippingInfo;
  items: OrderLine[];
  subtotal: number;
  total: number;
  currency: string;
  payment?: OrderPayment;
  createdAt: string;
}

/** Thai mobile/landline: 9–10 digits, optionally +66 with 8–9 digits after. */
const PHONE_RE = /^(\+66[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|0\d{1,2}[\s-]?\d{3}[\s-]?\d{4})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_RE = /^\d{5}$/;

export const SHIPPING_REQUIRED: ShippingField[] = [
  "fullName",
  "email",
  "phone",
  "address",
  "district",
  "province",
  "postalCode",
];

/**
 * Returns a map of field → error key (matching the `checkout.errors.*`
 * translation keys). Empty map means valid.
 */
export function validateShipping(
  form: ShippingInfo
): Partial<Record<ShippingField, string>> {
  const errors: Partial<Record<ShippingField, string>> = {};
  for (const field of SHIPPING_REQUIRED) {
    if (!form[field]?.trim()) errors[field] = "required";
  }
  if (!errors.email && !EMAIL_RE.test(form.email.trim())) errors.email = "email";
  if (!errors.phone && !PHONE_RE.test(form.phone.trim())) errors.phone = "phone";
  if (!errors.postalCode && !POSTAL_RE.test(form.postalCode.trim())) {
    errors.postalCode = "postalCode";
  }
  return errors;
}

/** Coerce an untrusted body into a ShippingInfo (all fields present, trimmed). */
export function asShipping(raw: unknown): ShippingInfo {
  const v = (raw ?? {}) as Record<string, unknown>;
  const str = (k: ShippingField) => (typeof v[k] === "string" ? (v[k] as string).trim() : "");
  return {
    fullName: str("fullName"),
    email: str("email"),
    phone: str("phone"),
    address: str("address"),
    district: str("district"),
    province: str("province"),
    postalCode: str("postalCode"),
    note: str("note"),
  };
}

export function makeOrderId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RP-${date}-${rand}`;
}
