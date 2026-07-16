import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BASE = "http://localhost:3000";
const out = [];
const check = (n, ok, d = "") => out.push(`${ok ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);
const created = [];

const SHIPPING = {
  fullName: "Somchai Jaidee", email: "somchai@example.com", phone: "0812345678",
  address: "88/12 Sukhumvit 55", district: "Watthana", province: "Bangkok",
  postalCode: "10110", note: "",
};

const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

try {
  const hasKeys = Boolean(env.OMISE_SECRET_KEY);
  out.push(`(Omise keys present: ${hasKeys ? "yes" : "no — verifying graceful degradation"})`);

  // make a real order to pay against
  const r = await post("/api/checkout", { shipping: SHIPPING, items: [{ id: "luba-3-awd-3000", qty: 1 }] });
  const orderId = r.body?.orderId;
  if (orderId) created.push(orderId);
  check("order created for payment tests", !!orderId);

  // pay route without keys must 503, not crash
  let p = await post("/api/checkout/pay", { orderId, token: "tokn_test_fake" });
  if (!hasKeys) {
    check("pay route degrades to 503 without keys", p.status === 503, `status=${p.status}`);
    check("503 body explains why", /OMISE_SECRET_KEY|not configured/i.test(p.body?.error ?? ""), p.body?.error);
  }

  // input validation happens regardless of keys
  p = await post("/api/checkout/pay", { orderId });
  check("pay rejects missing token", p.status === 400 || p.status === 503, `status=${p.status}`);

  p = await post("/api/checkout/pay", { orderId: "RP-00000000-XXXX", token: "tokn_x" });
  check("pay rejects unknown order (404/503)", [404, 503].includes(p.status), `status=${p.status}`);

  // status route
  let res = await fetch(`${BASE}/api/orders/${orderId}/status`);
  let body = await res.json();
  check("status route returns pending_payment", body?.status === "pending_payment", body?.status);
  check("status route leaks no shipping/PII", !("shipping" in (body ?? {})) && !("items" in (body ?? {})), Object.keys(body ?? {}).join(","));

  res = await fetch(`${BASE}/api/orders/RP-00000000-XXXX/status`);
  check("status route 404s unknown order", res.status === 404, `status=${res.status}`);

  // webhook must never trust the body: a forged 'paid' event with no real
  // charge behind it must not settle the order
  const before = (await supabase.from("orders").select("status").eq("id", orderId).single()).data?.status;
  const w = await post("/api/webhooks/omise", {
    key: "charge.complete",
    data: { object: "charge", id: "chrg_test_forged", status: "successful", paid: true,
            metadata: { orderId } },
  });
  const after = (await supabase.from("orders").select("status").eq("id", orderId).single()).data?.status;
  check("forged webhook did NOT mark order paid", after !== "paid", `before=${before} after=${after} (webhook status=${w.status})`);

  // non-charge events are acknowledged, not retried forever
  const w2 = await post("/api/webhooks/omise", { key: "transfer.create", data: { object: "transfer", id: "trsf_1" } });
  if (hasKeys) check("non-charge event acknowledged", w2.status === 200, `status=${w2.status}`);

  // paid orders can't be re-charged
  await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
  p = await post("/api/checkout/pay", { orderId, token: "tokn_test_fake" });
  if (hasKeys) {
    check("already-paid order is not charged again", p.body?.status === "paid", JSON.stringify(p.body));
  }
} catch (e) {
  out.push("ERROR " + e.message);
} finally {
  if (created.length) {
    await supabase.from("orders").delete().in("id", created);
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).in("id", created);
    out.push(`cleanup: removed ${created.length} test orders, ${count ?? 0} left behind`);
  }
  console.log(out.join("\n"));
}
