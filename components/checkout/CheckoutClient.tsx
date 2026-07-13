"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CircleCheck,
  Info,
  MapPin,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import ProductVisual from "@/components/ui/ProductVisual";
import { useCart, type CartLine } from "@/components/cart/CartProvider";
import { useProducts } from "@/components/ProductsProvider";
import { formatBaht, SERVICE_CATEGORY, type Product } from "@/data/products";

const ORDERS_KEY = "raaspal-orders";

/** One upsell suggestion: a service package attached to a robot in the cart. */
interface UpsellOffer {
  key: string;
  service: Product;
  robot: Product;
  kind: "install" | "demo";
}

/** "5,000 m²" → 5000; NaN when the spec is missing/unparsable. */
const parseArea = (spec?: string) =>
  spec ? Number(spec.replace(/[^0-9]/g, "")) : NaN;

/**
 * PRD req 11: before payment, offer installation tiers matched to the robots
 * in the cart (smallest tier that covers the robot's area spec), or a demo.
 * Robots that already have that service attached in the cart are skipped.
 */
function buildOffers(items: CartLine[], catalog: Product[]): UpsellOffer[] {
  const robots = items.filter((l) => l.product.category !== SERVICE_CATEGORY);
  if (robots.length === 0) return [];

  const tiers = catalog
    .filter((p) => p.category === SERVICE_CATEGORY && p.variant === "install")
    .sort((a, b) => parseArea(a.specs.area) - parseArea(b.specs.area));
  const demo = catalog.find(
    (p) => p.category === SERVICE_CATEGORY && p.variant === "demo"
  );

  const hasService = (serviceId: string, robotId: string) =>
    items.some((l) => l.id === serviceId && l.forId === robotId);

  const offers: UpsellOffer[] = [];
  for (const line of robots) {
    const area = parseArea(line.product.specs.area);
    const tier =
      tiers.find((s) => Number.isNaN(area) || parseArea(s.specs.area) >= area) ??
      tiers[tiers.length - 1];
    if (tier && !hasService(tier.id, line.id)) {
      offers.push({
        key: `${tier.id}__${line.id}`,
        service: tier,
        robot: line.product,
        kind: "install",
      });
    }
  }
  if (demo && !items.some((l) => l.id === demo.id)) {
    offers.push({
      key: `${demo.id}__${robots[0].id}`,
      service: demo,
      robot: robots[0].product,
      kind: "demo",
    });
  }
  return offers.slice(0, 4);
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  note: string;
}

type FieldName = keyof ShippingInfo;

const EMPTY_FORM: ShippingInfo = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
  note: "",
};

interface PlacedOrder {
  id: string;
  createdAt: string;
  status: "pending-payment";
  shipping: ShippingInfo;
  items: {
    id: string;
    name: string;
    qty: number;
    unitPrice: number;
    /** For service lines: the robot this service was bought for. */
    forName?: string;
  }[];
  subtotal: number;
}

/** Thai mobile/landline: 9–10 digits, optionally +66 with 8–9 digits after. */
const PHONE_RE = /^(\+66[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}|0\d{1,2}[\s-]?\d{3}[\s-]?\d{4})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_RE = /^\d{5}$/;

function validate(form: ShippingInfo): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  const required: FieldName[] = [
    "fullName",
    "email",
    "phone",
    "address",
    "district",
    "province",
    "postalCode",
  ];
  for (const field of required) {
    if (!form[field].trim()) errors[field] = "required";
  }
  if (!errors.email && !EMAIL_RE.test(form.email.trim())) errors.email = "email";
  if (!errors.phone && !PHONE_RE.test(form.phone.trim())) errors.phone = "phone";
  if (!errors.postalCode && !POSTAL_RE.test(form.postalCode.trim()))
    errors.postalCode = "postalCode";
  return errors;
}

function makeOrderId(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RP-${date}-${rand}`;
}

function Field({
  name,
  label,
  error,
  optional,
  children,
}: {
  name: FieldName;
  label: string;
  error?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[13px] font-semibold text-forest">
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-ink-muted">({optional})</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[12px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `min-h-[48px] w-full rounded-xl border bg-white px-4 text-[14px] text-forest placeholder:text-ink-muted/60 transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-forest-100 focus:border-gold focus:ring-gold/25"
  }`;

function SummaryLine({ item, forLabel }: { item: CartLine; forLabel?: string }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
        <ProductVisual product={item.product} className="h-full w-auto" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold text-forest">
          {item.product.name}
        </span>
        {forLabel && (
          <span className="block truncate text-[11.5px] font-medium text-gold-600">
            {forLabel}
          </span>
        )}
        <span className="block text-[12px] text-ink-muted">
          {formatBaht(item.product.price)} × {item.qty}
        </span>
      </span>
      <span className="font-mono text-[14px] font-semibold tabular-nums text-forest">
        {formatBaht(item.qty * item.product.price)}
      </span>
    </li>
  );
}

export default function CheckoutClient() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const { items, subtotal, clear, add } = useCart();
  const { products } = useProducts();

  const [form, setForm] = useState<ShippingInfo>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [offers, setOffers] = useState<UpsellOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  // the prompt appears at most once per checkout — dismissing must never block payment
  const [upsellShown, setUpsellShown] = useState(false);

  const setField = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    // clear the error as soon as the user starts fixing the field
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const placeOrder = (lines: CartLine[]) => {
    const order: PlacedOrder = {
      id: makeOrderId(),
      createdAt: new Date().toISOString(),
      status: "pending-payment",
      shipping: form,
      items: lines.map((item) => ({
        id: item.id,
        name: item.product.name,
        qty: item.qty,
        unitPrice: item.product.price,
        ...(item.forProduct ? { forName: item.forProduct.name } : {}),
      })),
      subtotal: lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
    };

    // Local record until the orders backend lands; the Omise payment step
    // will slot in between validation and this confirmation.
    try {
      const prev = JSON.parse(window.localStorage.getItem(ORDERS_KEY) ?? "[]");
      window.localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([...(Array.isArray(prev) ? prev : []), order])
      );
    } catch {
      // storage unavailable — order still confirmed on screen
    }

    setUpsellOpen(false);
    setPlaced(order);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document
        .querySelector('[role="alert"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // PRD req 11: one upsell prompt before payment when the cart has robots
    // without a matching service. Dismissing proceeds normally.
    if (!upsellShown) {
      const nextOffers = buildOffers(items, products);
      if (nextOffers.length > 0) {
        setOffers(nextOffers);
        setSelectedOffer(nextOffers[0].key);
        setUpsellShown(true);
        setUpsellOpen(true);
        return;
      }
    }

    placeOrder(items);
  };

  /** Upsell "Add & continue": include the chosen package in cart + order. */
  const acceptOffer = () => {
    const offer = offers.find((o) => o.key === selectedOffer);
    if (!offer) {
      placeOrder(items);
      return;
    }
    // reflect it in the cart (for the record) and in this order's lines
    add(offer.service.id, 1, offer.robot.id);
    const extraLine: CartLine = {
      id: offer.service.id,
      qty: 1,
      forId: offer.robot.id,
      key: `${offer.service.id}__for__${offer.robot.id}`,
      product: offer.service,
      forProduct: offer.robot,
    };
    placeOrder([...items, extraLine]);
  };

  /* success screen */
  if (placed) {
    return (
      <FadeIn className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-forest-100 bg-white p-8 text-center sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
            <CircleCheck className="h-8 w-8 text-gold-600" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-forest">
            {t("success.heading")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
            {t("success.body", {
              name: placed.shipping.fullName,
              phone: placed.shipping.phone,
            })}
          </p>

          <div className="mt-8 rounded-2xl bg-cloud px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              {t("success.orderLabel")}
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-wide text-forest">
              {placed.id}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-forest-100 px-6 py-5 text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              {t("success.itemsHeading")}
            </p>
            <ul className="mt-3 space-y-2">
              {placed.items.map((item) => (
                <li
                  key={item.forName ? `${item.id}-${item.forName}` : item.id}
                  className="flex items-baseline justify-between gap-4 text-[13.5px]"
                >
                  <span className="font-medium text-forest">
                    {item.name} <span className="text-ink-muted">× {item.qty}</span>
                    {item.forName && (
                      <span className="block text-[11.5px] font-normal text-gold-600">
                        {tc("forRobot", { name: item.forName })}
                      </span>
                    )}
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-forest">
                    {formatBaht(item.qty * item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-forest-100 pt-4">
              <span className="text-[13px] font-semibold text-forest">{t("total")}</span>
              <span className="font-mono text-lg font-semibold tabular-nums text-forest">
                {formatBaht(placed.subtotal)}
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gold px-8 text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)]"
          >
            {t("success.continueShopping")}
            <ArrowUpRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
        </div>
      </FadeIn>
    );
  }

  /* empty cart */
  if (items.length === 0) {
    return (
      <FadeIn className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/5">
          <ShoppingCart className="h-7 w-7 text-forest/30" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">{t("empty")}</p>
        <Link
          href="/shop"
          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-gold px-7 text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)]"
        >
          {t("emptyCta")}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </FadeIn>
    );
  }

  const err = (name: FieldName) =>
    errors[name] ? t(`errors.${errors[name]}`) : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
      {/* left: form */}
      <div className="space-y-10">
        <FadeIn>
          <section aria-labelledby="contact-heading">
            <h2
              id="contact-heading"
              className="flex items-center gap-2.5 font-display text-lg font-bold text-forest"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
                <UserRound className="h-4 w-4 text-gold-600" aria-hidden="true" />
              </span>
              {t("contactHeading")}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field name="fullName" label={t("fullName")} error={err("fullName")}>
                  <input
                    id="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={setField("fullName")}
                    className={inputClass(!!errors.fullName)}
                  />
                </Field>
              </div>
              <Field name="email" label={t("email")} error={err("email")}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={setField("email")}
                  className={inputClass(!!errors.email)}
                />
              </Field>
              <Field name="phone" label={t("phone")} error={err("phone")}>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="08x-xxx-xxxx"
                  value={form.phone}
                  onChange={setField("phone")}
                  className={inputClass(!!errors.phone)}
                />
              </Field>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.08}>
          <section aria-labelledby="shipping-heading">
            <h2
              id="shipping-heading"
              className="flex items-center gap-2.5 font-display text-lg font-bold text-forest"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
                <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
              </span>
              {t("shippingHeading")}
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field name="address" label={t("address")} error={err("address")}>
                  <input
                    id="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={setField("address")}
                    className={inputClass(!!errors.address)}
                  />
                </Field>
              </div>
              <Field name="district" label={t("district")} error={err("district")}>
                <input
                  id="district"
                  autoComplete="address-level2"
                  value={form.district}
                  onChange={setField("district")}
                  className={inputClass(!!errors.district)}
                />
              </Field>
              <Field name="province" label={t("province")} error={err("province")}>
                <input
                  id="province"
                  autoComplete="address-level1"
                  value={form.province}
                  onChange={setField("province")}
                  className={inputClass(!!errors.province)}
                />
              </Field>
              <Field name="postalCode" label={t("postalCode")} error={err("postalCode")}>
                <input
                  id="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={form.postalCode}
                  onChange={setField("postalCode")}
                  className={inputClass(!!errors.postalCode)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field name="note" label={t("note")} optional={t("optional")}>
                  <input
                    id="note"
                    placeholder={t("notePlaceholder")}
                    value={form.note}
                    onChange={setField("note")}
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            </div>
          </section>
        </FadeIn>
      </div>

      {/* right: summary */}
      <FadeIn delay={0.12}>
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-forest-100 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-forest">
              {t("summaryHeading")}
            </h2>
            <ul className="mt-2 divide-y divide-forest-100/70">
              {items.map((item) => (
                <SummaryLine
                  key={item.key}
                  item={item}
                  forLabel={
                    item.forProduct
                      ? tc("forRobot", { name: item.forProduct.name })
                      : undefined
                  }
                />
              ))}
            </ul>

            <dl className="space-y-2.5 border-t border-forest-100 pt-4 text-[13.5px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">{t("subtotal")}</dt>
                <dd className="font-mono font-semibold tabular-nums text-forest">
                  {formatBaht(subtotal)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">{t("shipping")}</dt>
                <dd className="text-[12.5px] font-medium text-gold-600">
                  {t("shippingTbd")}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-forest-100 pt-3">
                <dt className="font-semibold text-forest">{t("total")}</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-forest">
                  {formatBaht(subtotal)}
                </dd>
              </div>
            </dl>

            <button
              type="submit"
              className="mt-6 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)]"
            >
              {t("placeOrder")}
              <ArrowUpRight className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-ink-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden="true" />
              {t("paymentNote")}
            </p>
          </div>
        </aside>
      </FadeIn>

      {/* upsell prompt — shown once before payment (PRD req 11) */}
      <AnimatePresence>
        {upsellOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => placeOrder(items)}
              className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              role="dialog"
              aria-modal="true"
              aria-label={t("upsell.heading")}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20">
                  <Sparkles className="h-5 w-5 text-gold-600" aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={() => placeOrder(items)}
                  aria-label={t("upsell.skip")}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-forest/5 hover:text-forest"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <h2 className="mt-4 font-display text-xl font-extrabold tracking-tight text-forest sm:text-2xl">
                {t("upsell.heading")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t("upsell.subtext")}
              </p>

              <div className="mt-5 max-h-72 space-y-2.5 overflow-y-auto">
                {offers.map((offer, i) => (
                  <label
                    key={offer.key}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition-colors ${
                      selectedOffer === offer.key
                        ? "border-gold bg-gold/10"
                        : "border-forest-100 hover:border-gold/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="upsell-offer"
                      checked={selectedOffer === offer.key}
                      onChange={() => setSelectedOffer(offer.key)}
                      className="sr-only"
                    />
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
                      <ProductVisual
                        product={offer.service}
                        className="h-full w-auto"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-bold leading-snug text-forest">
                          {offer.service.name}
                        </span>
                        {i === 0 && (
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-gold-600">
                            {t("upsell.recommendedBadge")}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-ink-muted">
                        {t(offer.kind === "install" ? "upsell.installFor" : "upsell.demoFor", {
                          name: offer.robot.name,
                        })}
                      </span>
                    </span>
                    <span className="font-mono text-[14px] font-semibold tabular-nums text-forest">
                      {formatBaht(offer.service.price)}
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={acceptOffer}
                className="mt-5 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)]"
              >
                {t("upsell.addAndContinue")}
                <ArrowUpRight className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => placeOrder(items)}
                className="mt-3 w-full cursor-pointer text-center text-[13px] font-medium text-ink-muted transition-colors hover:text-forest"
              >
                {t("upsell.skip")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </form>
  );
}
