"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  CircleCheck,
  CreditCard,
  Info,
  LoaderCircle,
  MapPin,
  QrCode,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import CartIcon from "@/components/cart/CartIcon";
import FadeIn from "@/components/ui/FadeIn";
import ProductVisual from "@/components/ui/ProductVisual";
import CardPaymentForm from "@/components/checkout/CardPaymentForm";
import PromptPayForm from "@/components/checkout/PromptPayForm";
import { useCart, type CartLine } from "@/components/cart/CartProvider";
import { useProducts } from "@/components/ProductsProvider";
import { formatBaht, hasPrice, SERVICE_CATEGORY, type PricedProduct, type Product } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import {
  EMPTY_SHIPPING,
  validateShipping,
  type OrderLine,
  type ShippingField,
  type ShippingInfo,
} from "@/lib/checkout";

/** A robot in the cart plus every installation tier the shopper can pick for it. */
interface InstallGroup {
  /** The robot's cart-line id — used to build each tier's `${tierId}__for__${id}` key. */
  robotId: string;
  robot: Product;
  /** All installation tiers, smallest coverage area first. */
  tiers: PricedProduct[];
  /** Id of the smallest tier that covers the robot's area — badged "Recommended". */
  recommendedId: string;
}

/** "5,000 m²" → 5000; NaN when the spec is missing/unparsable. */
const parseArea = (spec?: string) =>
  spec ? Number(spec.replace(/[^0-9]/g, "")) : NaN;

/**
 * PRD req 11 + #32: for each robot in the cart, offer professional installation
 * and let the shopper choose the coverage area themselves — every install tier
 * is listed, with the smallest one that covers the robot's area flagged as the
 * recommendation (rather than silently forcing that tier as before). Demo
 * packages are deliberately NOT offered here — a demo's purpose is to win an
 * undecided buyer before purchase, so it belongs on its own product page.
 */
function buildInstallGroups(items: CartLine[], catalog: Product[]): InstallGroup[] {
  const robots = items.filter((l) => l.product.category !== SERVICE_CATEGORY);
  if (robots.length === 0) return [];

  const tiers = catalog
    .filter(hasPrice)
    .filter((p) => p.category === SERVICE_CATEGORY && p.variant === "installation")
    .sort((a, b) => parseArea(a.specs.area) - parseArea(b.specs.area));
  if (tiers.length === 0) return [];

  return robots.slice(0, 4).map((line) => {
    const area = parseArea(line.product.specs.area);
    const recommended =
      tiers.find((s) => Number.isNaN(area) || parseArea(s.specs.area) >= area) ??
      tiers[tiers.length - 1];
    return {
      robotId: line.id,
      robot: line.product,
      tiers,
      recommendedId: recommended.id,
    };
  });
}

type FieldName = ShippingField;

/** What the confirmation screen shows, as returned by the checkout API. */
interface PlacedOrder {
  id: string;
  items: OrderLine[];
  total: number;
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
      <label htmlFor={name} className="text-[13px] font-semibold text-content">
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
  `min-h-[48px] w-full rounded-xl border bg-surface px-4 text-[14px] text-content placeholder:text-ink-muted/60 transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-forest-100 focus:border-accent focus:ring-accent/25"
  }`;

function SummaryLine({ item, forLabel }: { item: CartLine; forLabel?: string }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
        <ProductVisual product={item.product} className="h-full w-auto" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-bold text-content">
          {item.product.name}
        </span>
        {forLabel && (
          <span className="block truncate text-[11.5px] font-medium text-accent-600">
            {forLabel}
          </span>
        )}
        <span className="block text-[12px] text-ink-muted">
          {siteConfig.showPrices
            ? `${formatBaht(item.product.price)} × ${item.qty}`
            : `× ${item.qty}`}
        </span>
      </span>
      {siteConfig.showPrices && (
        <span className="font-mono text-[14px] font-semibold tabular-nums text-content">
          {formatBaht(item.qty * item.product.price)}
        </span>
      )}
    </li>
  );
}

export default function CheckoutClient() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const tp = useTranslations("payment");
  const tq = useTranslations("quotation");
  const locale = useLocale();
  const { items, subtotal, clear, add, remove } = useCart();
  const { products } = useProducts();
  // Absent until the Omise keys are added; the order still gets created and the
  // customer sees the previous "our team will contact you" confirmation.
  const omisePublicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;

  const [form, setForm] = useState<ShippingInfo>(EMPTY_SHIPPING);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // which payment method the customer picked on the post-order payment screen
  const [payMethod, setPayMethod] = useState<"card" | "promptpay">("card");

  // Installation offered per robot in the cart, as a live choice of coverage
  // area (PRD req 11). Picking a tier adds it to the cart straight away, so the
  // order summary reflects the choice at once.
  const installGroups = useMemo(
    () => buildInstallGroups(items, products),
    [items, products]
  );
  // The install tier currently chosen for a robot, if any (one per robot).
  const selectedTierId = (group: InstallGroup) =>
    items.find(
      (l) => l.forId === group.robotId && l.product.variant === "installation"
    )?.product.id ?? null;
  // Radio behaviour: picking a tier replaces any other install tier for that
  // robot; picking "No installation" (tier = null) just clears it.
  const chooseInstall = (group: InstallGroup, tier: Product | null) => {
    const current = selectedTierId(group);
    if (current === (tier?.id ?? null)) return;
    if (current) remove(`${current}__for__${group.robotId}`);
    if (tier) add(tier.id, 1, group.robotId);
  };

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

  /**
   * Creates the order on the server. Only ids/quantities are sent — the API
   * reprices every line from the catalog, so the totals shown on the
   * confirmation are the server's, not the browser's.
   */
  const placeOrder = async (lines: CartLine[]) => {
    setBusy(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: form,
          // Decides which language the confirmation email is written in.
          locale,
          items: lines.map((l) => ({
            id: l.id,
            qty: l.qty,
            ...(l.forId ? { forId: l.forId } : {}),
          })),
        }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        if (body?.errors) setErrors(body.errors);
        setSubmitError(body?.error ?? `Could not place the order (${res.status})`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setPlaced({ id: body.orderId, items: body.items, total: body.total });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateShipping(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document
        .querySelector('[role="alert"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Add-ons are chosen up front via the toggles above the form, so the cart
    // already holds them — nothing to prompt for here, just place the order.
    placeOrder(items);
  };

  /* order created — collect payment (or, until Omise keys exist, confirm and
     tell the customer the team will arrange payment as before) */
  if (placed) {
    return (
      <FadeIn className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-forest-100 bg-surface p-8 text-center sm:p-12">
          {omisePublicKey ? (
            <>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-content">
                {tp("heading")}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                {tp("sub", { orderId: placed.id })}
              </p>

              {/* method picker — PromptPay is the dominant method in Thailand,
                  so it sits alongside card rather than behind it */}
              <div
                role="tablist"
                aria-label={tp("methods.heading")}
                className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-2 rounded-full bg-cloud p-1.5"
              >
                {(["card", "promptpay"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={payMethod === m}
                    onClick={() => setPayMethod(m)}
                    className={`flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition-colors ${
                      payMethod === m
                        ? "bg-accent text-on-accent"
                        : "text-ink-muted hover:text-content"
                    }`}
                  >
                    {m === "card" ? (
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <QrCode className="h-4 w-4" aria-hidden="true" />
                    )}
                    {tp(`methods.${m}`)}
                  </button>
                ))}
              </div>

              <div className="mt-8 text-left">
                {payMethod === "card" ? (
                  <CardPaymentForm
                    orderId={placed.id}
                    total={placed.total}
                    publicKey={omisePublicKey}
                  />
                ) : (
                  <PromptPayForm orderId={placed.id} total={placed.total} />
                )}
              </div>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <CircleCheck className="h-8 w-8 text-accent-600" aria-hidden="true" />
              </span>
              <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-content">
                {t("success.heading")}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                {t("success.body", {
                  name: form.fullName,
                  phone: form.phone,
                })}
              </p>
            </>
          )}

          <div className="mt-8 rounded-2xl bg-cloud px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              {t("success.orderLabel")}
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-wide text-content">
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
                  <span className="font-medium text-content">
                    {item.name} <span className="text-ink-muted">× {item.qty}</span>
                    {item.forName && (
                      <span className="block text-[11.5px] font-normal text-accent-600">
                        {tc("forRobot", { name: item.forName })}
                      </span>
                    )}
                  </span>
                  {siteConfig.showPrices && (
                    <span className="font-mono font-semibold tabular-nums text-content">
                      {formatBaht(item.qty * item.unitPrice)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {siteConfig.showPrices ? (
              <div className="mt-4 flex items-baseline justify-between border-t border-forest-100 pt-4">
                <span className="text-[13px] font-semibold text-content">{t("total")}</span>
                <span className="font-mono text-lg font-semibold tabular-nums text-content">
                  {formatBaht(placed.total)}
                </span>
              </div>
            ) : (
              <p className="mt-4 border-t border-forest-100 pt-4 text-[12.5px] leading-relaxed text-ink-muted">
                {tq("totalPending")}
              </p>
            )}
          </div>

          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-accent px-8 text-[15px] font-bold text-on-accent transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_rgb(var(--accent-rgb)/0.7)]"
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
          <CartIcon className="h-7 w-7 text-content/30" />
        </span>
        <p className="text-sm leading-relaxed text-ink-muted">{t("empty")}</p>
        <Link
          href="/shop"
          className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-accent px-7 text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)]"
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
        {submitError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
          >
            {submitError}
          </p>
        )}

        {installGroups.length > 0 && (
          <FadeIn>
            <section aria-labelledby="addons-heading">
              <h2
                id="addons-heading"
                className="flex items-center gap-2.5 font-display text-lg font-bold text-content"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                  <Sparkles className="h-4 w-4 text-accent-600" aria-hidden="true" />
                </span>
                {t("upsell.heading")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {t("upsell.subtext")}
              </p>

              <div className="mt-5 space-y-4">
                {installGroups.map((group) => {
                  const selected = selectedTierId(group);
                  // tier options, then an explicit opt-out; `null` id = "none"
                  const options: (PricedProduct | null)[] = [...group.tiers, null];
                  return (
                    <div
                      key={group.robotId}
                      className="rounded-2xl border border-forest-100 p-4"
                    >
                      {/* which robot this installation is for */}
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
                          <ProductVisual product={group.robot} className="h-full w-auto" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-bold text-content">
                            {t("upsell.installFor", { name: group.robot.name })}
                          </p>
                          <p className="text-[12px] text-ink-muted">
                            {t("upsell.chooseArea")}
                          </p>
                        </div>
                      </div>

                      {/* coverage-area choices — one installation per robot */}
                      <div
                        role="radiogroup"
                        aria-label={t("upsell.installFor", { name: group.robot.name })}
                        className="mt-3 space-y-2"
                      >
                        {options.map((tier) => {
                          const checked = selected === (tier?.id ?? null);
                          const recommended = !!tier && tier.id === group.recommendedId;
                          return (
                            <label
                              key={tier?.id ?? "none"}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                                checked
                                  ? "border-accent bg-accent/10"
                                  : "border-forest-100 hover:border-accent/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`install-${group.robotId}`}
                                checked={checked}
                                onChange={() => chooseInstall(group, tier)}
                                className="sr-only"
                              />
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                  checked ? "border-accent" : "border-forest-200"
                                }`}
                                aria-hidden="true"
                              >
                                {checked && (
                                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                                )}
                              </span>
                              {tier ? (
                                <>
                                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                    <span className="text-[13.5px] font-semibold text-content">
                                      {tier.specs.area}
                                    </span>
                                    {recommended && (
                                      <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-accent-600">
                                        {t("upsell.recommendedBadge")}
                                      </span>
                                    )}
                                  </span>
                                  {siteConfig.showPrices && (
                                    <span className="font-mono text-[14px] font-semibold tabular-nums text-content">
                                      {formatBaht(tier.price)}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="flex-1 text-[13.5px] font-medium text-ink-muted">
                                  {t("upsell.noInstall")}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        )}

        <FadeIn>
          <section aria-labelledby="contact-heading">
            <h2
              id="contact-heading"
              className="flex items-center gap-2.5 font-display text-lg font-bold text-content"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <UserRound className="h-4 w-4 text-accent-600" aria-hidden="true" />
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
              className="flex items-center gap-2.5 font-display text-lg font-bold text-content"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <MapPin className="h-4 w-4 text-accent-600" aria-hidden="true" />
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
          <div className="rounded-3xl border border-forest-100 bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-content">
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

            {!siteConfig.showPrices ? (
              // Quotation mode: no subtotal, shipping, or total — none of them
              // are known until the property has been assessed and quoted.
              <p className="border-t border-forest-100 pt-4 text-[13px] leading-relaxed text-ink-muted">
                {tq("totalPending")}
              </p>
            ) : (
            <dl className="space-y-2.5 border-t border-forest-100 pt-4 text-[13.5px]">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">{t("subtotal")}</dt>
                <dd className="font-mono font-semibold tabular-nums text-content">
                  {formatBaht(subtotal)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-muted">{t("shipping")}</dt>
                <dd className="text-[12.5px] font-medium text-accent-600">
                  {t("shippingTbd")}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-forest-100 pt-3">
                <dt className="font-semibold text-content">{t("total")}</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-content">
                  {formatBaht(subtotal)}
                </dd>
              </div>
            </dl>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-bold text-on-accent transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_32px_-6px_rgb(var(--accent-rgb)/0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy ? (
                <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  {siteConfig.showPrices ? t("placeOrder") : tq("submitCta")}
                  <ArrowUpRight className="h-4.5 w-4.5" aria-hidden="true" />
                </>
              )}
            </button>

            <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-ink-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden="true" />
              {t("paymentNote")}
            </p>

            {/* The return/refund terms have to be reachable *before* the order
                is placed, not only from the footer — it is the point where the
                customer is committing, and it is what a payment provider's
                merchant review looks for. */}
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              <Link
                href="/refund-policy"
                className="underline underline-offset-2 transition-colors hover:text-accent-600"
              >
                {t("refundPolicyLink")}
              </Link>
            </p>
          </div>
        </aside>
      </FadeIn>
    </form>
  );
}
