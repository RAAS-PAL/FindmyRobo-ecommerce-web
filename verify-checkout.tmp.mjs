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
const results = [];
const check = (n, ok, d = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

const SHIPPING = {
  fullName: "Somchai Jaidee",
  email: "somchai@example.com",
  phone: "0812345678",
  address: "88/12 Sukhumvit 55",
  district: "Watthana",
  province: "Bangkok",
  postalCode: "10110",
  note: "",
};

const post = async (body) => {
  const res = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const created = [];

try {
  // real catalog prices, to assert against
  const { data: prods } = await supabase.from("products").select("id,price,name");
  const price = Object.fromEntries(prods.map((p) => [p.id, p.price]));
  const luba = "luba-3-awd-3000";
  const install = "install-up-to-10000";

  // 1. happy path
  let r = await post({ shipping: SHIPPING, items: [{ id: luba, qty: 1 }] });
  check("creates order (201)", r.status === 201, `status=${r.status}`);
  check("total is the catalog price", r.body?.total === price[luba], `${r.body?.total} vs ${price[luba]}`);
  if (r.body?.orderId) created.push(r.body.orderId);

  // row actually persisted?
  const { data: row } = await supabase.from("orders").select("*").eq("id", r.body?.orderId).maybeSingle();
  check("order row persisted in Supabase", !!row);
  check("status starts pending_payment", row?.status === "pending_payment", row?.status);
  check("guest order has null user_id", row?.user_id === null);
  check("currency THB", row?.currency === "THB");
  check("items snapshot has name+unitPrice", row?.items?.[0]?.name === price[luba] ? false : !!row?.items?.[0]?.name && row?.items?.[0]?.unitPrice === price[luba]);

  // 2. THE SECURITY TEST: client lies about the price
  r = await post({
    shipping: SHIPPING,
    items: [{ id: luba, qty: 1, unitPrice: 1, price: 1, total: 1 }],
    subtotal: 1,
    total: 1,
  });
  check("IGNORES client-supplied price (charges real price)", r.body?.total === price[luba], `got ${r.body?.total}, real ${price[luba]}`);
  if (r.body?.orderId) created.push(r.body.orderId);

  // 3. quantity is respected and multiplied server-side
  r = await post({ shipping: SHIPPING, items: [{ id: luba, qty: 3 }] });
  check("qty multiplies server-side", r.body?.total === price[luba] * 3, `${r.body?.total} vs ${price[luba] * 3}`);
  if (r.body?.orderId) created.push(r.body.orderId);

  // 4. service line keeps its robot association (upsell path)
  r = await post({
    shipping: SHIPPING,
    items: [{ id: luba, qty: 1 }, { id: install, qty: 1, forId: luba }],
  });
  const svc = r.body?.items?.find((i) => i.id === install);
  check("upsell service line persists forId/forName", svc?.forId === luba && !!svc?.forName, JSON.stringify(svc?.forName));
  check("multi-line total correct", r.body?.total === price[luba] + price[install], `${r.body?.total} vs ${price[luba] + price[install]}`);
  if (r.body?.orderId) created.push(r.body.orderId);

  // 5. rejections
  r = await post({ shipping: { ...SHIPPING, email: "nope" }, items: [{ id: luba, qty: 1 }] });
  check("rejects bad email (400)", r.status === 400 && !!r.body?.errors?.email);

  r = await post({ shipping: SHIPPING, items: [] });
  check("rejects empty cart (400)", r.status === 400);

  r = await post({ shipping: SHIPPING, items: [{ id: "does-not-exist", qty: 1 }] });
  check("rejects unknown product (409)", r.status === 409, `status=${r.status}`);

  r = await post({ shipping: SHIPPING, items: [{ id: luba, qty: -5 }] });
  check("rejects negative qty", r.status === 400, `status=${r.status}`);

  r = await post({ shipping: SHIPPING, items: [{ id: luba, qty: 99999 }] });
  check("rejects absurd qty (cap)", r.status === 400, `status=${r.status}`);
} catch (e) {
  results.push("ERROR " + e.message);
} finally {
  // clean up every order this test made
  if (created.length) {
    await supabase.from("orders").delete().in("id", created);
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("id", created);
    results.push(`cleanup: removed ${created.length} test orders, ${count ?? 0} left behind`);
  }
  console.log(results.join("\n"));
}
