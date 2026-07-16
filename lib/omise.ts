import "server-only";

/**
 * Minimal Omise (Opn Payments) server client.
 *
 * Direct HTTPS over fetch rather than an SDK: we need five endpoints, and this
 * keeps the dependency surface (and the blast radius of a supply-chain issue in
 * a package that handles money) at zero.
 *
 * SECURITY — read before changing anything here:
 *  - The secret key must never reach the browser. This module is server-only.
 *  - Card numbers must never reach our server. The browser tokenizes with
 *    Omise.js and sends us only a token, which keeps us at PCI SAQ-A.
 *  - Amounts are in the minor unit (satang). Our prices are whole baht, so
 *    every amount crosses this boundary through `toSatang` exactly once.
 */

const API = "https://api.omise.co";
const VAULT = "https://vault.omise.co";

/** Omise API version pinned so a server-side upgrade can't silently change behaviour. */
const OMISE_VERSION = "2019-05-29";

export function omiseConfigured(): boolean {
  return Boolean(process.env.OMISE_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.OMISE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "OMISE_SECRET_KEY is not set — add the Omise test keys to .env.local"
    );
  }
  return key;
}

/** ฿1,234 -> 123400 satang. Omise rejects non-integers. */
export function toSatang(baht: number): number {
  return Math.round(baht * 100);
}

/** 123400 satang -> ฿1,234. */
export function toBaht(satang: number): number {
  return Math.round(satang / 100);
}

export interface OmiseCharge {
  id: string;
  object: "charge";
  status: "successful" | "pending" | "reversed" | "expired" | "failed";
  paid: boolean;
  amount: number;
  currency: string;
  /** Set when the customer must be redirected (3-D Secure, e-wallets, banks). */
  authorize_uri: string | null;
  authorized: boolean;
  failure_code: string | null;
  failure_message: string | null;
  metadata?: Record<string, unknown>;
  source?: {
    id: string;
    type: string;
    scannable_code?: {
      image?: { download_uri?: string };
    };
  } | null;
  card?: { brand?: string; last_digits?: string } | null;
}

export interface OmiseSource {
  id: string;
  object: "source";
  type: string;
  amount: number;
  currency: string;
}

/** One payment method the account actually has enabled. */
export interface OmisePaymentMethod {
  name: string;
  currencies: string[];
  card_brands?: string[];
  installment_terms?: number[];
}

export interface OmiseCapability {
  payment_methods: OmisePaymentMethod[];
}

interface OmiseError {
  object: "error";
  code: string;
  message: string;
}

async function omiseFetch<T>(
  base: string,
  path: string,
  init?: { method?: string; form?: Record<string, string | number | undefined> }
): Promise<T> {
  const auth = Buffer.from(`${secretKey()}:`).toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
    "Omise-Version": OMISE_VERSION,
  };

  let body: string | undefined;
  if (init?.form) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(init.form)) {
      if (v !== undefined) params.append(k, String(v));
    }
    body = params.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const res = await fetch(`${base}${path}`, {
    method: init?.method ?? "GET",
    headers,
    body,
    cache: "no-store",
  });

  const json = (await res.json()) as T | OmiseError;
  if (
    typeof json === "object" &&
    json !== null &&
    (json as OmiseError).object === "error"
  ) {
    const err = json as OmiseError;
    throw new Error(`Omise ${err.code}: ${err.message}`);
  }
  if (!res.ok) throw new Error(`Omise request failed (${res.status})`);
  return json as T;
}

/**
 * Charge a card token. `amount` is in satang and must come from the stored
 * order — never from the request body.
 */
export function createCardCharge(params: {
  amount: number;
  token: string;
  orderId: string;
  returnUri: string;
  description?: string;
}): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>(API, "/charges", {
    method: "POST",
    form: {
      amount: params.amount,
      currency: "THB",
      card: params.token,
      // 3-D Secure is common on Thai cards: Omise then returns authorize_uri
      // and the customer is sent to their bank before the charge completes.
      return_uri: params.returnUri,
      description: params.description,
      "metadata[orderId]": params.orderId,
    },
  });
}

/** Create a source for any non-card method (promptpay, wallets, installments…). */
export function createSource(params: {
  type: string;
  amount: number;
  installmentTerm?: number;
}): Promise<OmiseSource> {
  return omiseFetch<OmiseSource>(API, "/sources", {
    method: "POST",
    form: {
      type: params.type,
      amount: params.amount,
      currency: "THB",
      installment_term: params.installmentTerm,
    },
  });
}

/** Charge a previously created source. */
export function createSourceCharge(params: {
  amount: number;
  sourceId: string;
  orderId: string;
  returnUri: string;
  description?: string;
}): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>(API, "/charges", {
    method: "POST",
    form: {
      amount: params.amount,
      currency: "THB",
      source: params.sourceId,
      return_uri: params.returnUri,
      description: params.description,
      "metadata[orderId]": params.orderId,
    },
  });
}

/**
 * Fetch a charge straight from Omise. This is the trust anchor: webhook
 * payloads and browser redirects are both untrusted, so both re-read the
 * charge through here before anything is marked paid.
 */
export function getCharge(id: string): Promise<OmiseCharge> {
  return omiseFetch<OmiseCharge>(API, `/charges/${encodeURIComponent(id)}`);
}

/** Which payment methods this account actually has enabled. */
export function getCapability(): Promise<OmiseCapability> {
  return omiseFetch<OmiseCapability>(API, "/capability");
}

export { VAULT as OMISE_VAULT };
