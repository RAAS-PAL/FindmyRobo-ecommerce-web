import "server-only";
import type { ShippingCarrier } from "@/lib/checkout";

/**
 * Minimal Sokochan (OMS / 3PL) server client.
 *
 * Direct HTTPS over fetch rather than an SDK — we need three endpoints and this
 * keeps the dependency surface at zero. Docs: https://oms.sokochan.com/docs/1.0
 *
 * SECURITY / OPERATION — read before changing:
 *  - The API key must never reach the browser. This module is server-only.
 *  - Auth is HTTP Basic over HTTPS: base64(account_login + ":" + api_key).
 *  - Every call is gated by sokochanConfigured(): with no keys set, callers must
 *    not invoke these functions — nothing here ever reaches Sokochan until the
 *    credentials exist.
 */

const DEFAULT_BASE = "https://oms.sokochan.com/api/1.0";

/** Carrier codes Sokochan accepts, with human labels for the admin UI. */
export const SHIPPING_CARRIERS: { code: ShippingCarrier; label: string }[] = [
  { code: "EMS", label: "ThaiPost EMS" },
  { code: "REG", label: "ThaiPost Registered" },
  { code: "KND", label: "Kerry (Next Day)" },
  { code: "K2D", label: "Kerry (2 Day)" },
  { code: "KSD", label: "Kerry (Same Day)" },
];

export function sokochanConfigured(): boolean {
  return Boolean(process.env.SOKOCHAN_LOGIN && process.env.SOKOCHAN_API_KEY);
}

function authHeader(): string {
  const login = process.env.SOKOCHAN_LOGIN;
  const key = process.env.SOKOCHAN_API_KEY;
  if (!login || !key) {
    throw new Error(
      "SOKOCHAN_LOGIN / SOKOCHAN_API_KEY are not set — add the Sokochan credentials to .env.local"
    );
  }
  return `Basic ${Buffer.from(`${login}:${key}`).toString("base64")}`;
}

function baseUrl(): string {
  return (process.env.SOKOCHAN_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

/* ------------------------------------------------------------------ types */

export interface SokochanCustomer {
  name: string;
  address: string;
  district?: string;
  province: string;
  postal_code: string;
  mobile_no?: string;
  phone_no?: string;
  email?: string;
}

export interface SokochanOrderItem {
  item_sku: string;
  item_qty: number;
}

export interface SokochanCreateOrderPayload {
  external_id: string;
  order_number?: string;
  comment?: string;
  shipping: ShippingCarrier | string;
  wrap?: number;
  customer: SokochanCustomer;
  order_items: SokochanOrderItem[];
}

export interface SokochanCreateOrderResponse {
  code: number;
  external_id: string;
  order_code: string;
  created: string;
}

interface SokochanError {
  code?: number;
  message?: string;
  error?: string;
}

/* ---------------------------------------------------------------- request */

async function sokochanFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as
    | (T & SokochanError)
    | null;

  if (!res.ok) {
    const msg =
      json?.message || json?.error || `Sokochan request failed (${res.status})`;
    throw new Error(msg);
  }
  if (json === null) {
    throw new Error("Sokochan returned an unreadable response");
  }
  return json as T;
}

/* --------------------------------------------------------------- endpoints */

/** Create a fulfilment order. Amount/price are never sent — Sokochan ships by SKU. */
export function createFulfillmentOrder(
  payload: SokochanCreateOrderPayload
): Promise<SokochanCreateOrderResponse> {
  return sokochanFetch<SokochanCreateOrderResponse>("/orders", {
    method: "POST",
    body: payload,
  });
}

/** Retrieve a fulfilment order by our external id — used to reconcile webhooks. */
export function getFulfillmentOrder(externalId: string): Promise<unknown> {
  return sokochanFetch<unknown>(
    `/order/get?external_id=${encodeURIComponent(externalId)}`
  );
}

/** Cancel a fulfilment order by external id. */
export function cancelFulfillmentOrder(externalId: string): Promise<unknown> {
  return sokochanFetch<unknown>("/order/cancel", {
    method: "PUT",
    body: { external_id: externalId },
  });
}
