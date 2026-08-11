"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, Ruler } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useProducts } from "@/components/ProductsProvider";
import { formatBaht, SERVICE_CATEGORY } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";

/** "5,000 m²" → 5000; NaN when the spec is missing/unparsable. */
const parseArea = (spec?: string) => (spec ? Number(spec.replace(/[^0-9]/g, "")) : NaN);

/**
 * Purchase panel for the on-site demo package (PRD #32). Two choices the
 * shopper must make on the page:
 *   1. the AREA to demo — the cost depends on it, so each area band is a
 *      separate service product (a "tier"); picking one selects which product
 *      gets added and thus the price;
 *   2. which ROBOT to demo — unlike installation this lists the catalog robots,
 *      not the cart, because a demo is aimed at someone still deciding and who
 *      may not have added anything yet. The pick travels with the line via
 *      `forId`.
 * Demo is intentionally absent from the checkout upsell (see CheckoutClient).
 */
export default function DemoPurchasePanel({ currentId }: { currentId: string }) {
  const t = useTranslations("service");
  const { products } = useProducts();

  // Demo area tiers = service products, variant "demo", with a parseable area.
  const tiers = useMemo(
    () =>
      products
        .filter(
          (p) =>
            p.category === SERVICE_CATEGORY &&
            p.variant === "demo" &&
            !Number.isNaN(parseArea(p.specs.area))
        )
        .sort((a, b) => parseArea(a.specs.area) - parseArea(b.specs.area)),
    [products]
  );

  // Robot models the shopper can ask to see — the whole catalog, not the cart.
  const robots = useMemo(
    () => products.filter((p) => p.category !== SERVICE_CATEGORY),
    [products]
  );

  // Default the area to the tier being viewed (if this page is one), else the
  // smallest; falls back to the current product id so a lone demo still works.
  const [tierId, setTierId] = useState(() =>
    tiers.some((x) => x.id === currentId) ? currentId : tiers[0]?.id ?? currentId
  );
  const [robotId, setRobotId] = useState("");

  // Price of the chosen area band; falls back to the current product before the
  // demo tiers are seeded, so the page never renders without a price.
  const current = products.find((p) => p.id === currentId);
  const selected = tiers.find((x) => x.id === tierId) ?? current;

  return (
    <div className="flex flex-col gap-5">
      {/* price of the selected area band */}
      {selected && siteConfig.showPrices && (
        <p className="font-mono text-3xl font-semibold tabular-nums text-content">
          {formatBaht(selected.price)}
        </p>
      )}

      {/* area selector — only shown when there are real tiers to choose from */}
      {tiers.length > 0 && (
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-content">
            <Ruler className="h-4 w-4 text-gold-600" aria-hidden="true" />
            {t("demoAreaLabel")}
          </legend>
          <div className="grid gap-2">
            {tiers.map((tier) => {
              const active = tier.id === tierId;
              return (
                <label
                  key={tier.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    active
                      ? "border-gold bg-gold/10"
                      : "border-forest-100 hover:border-gold/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="demo-area"
                      checked={active}
                      onChange={() => setTierId(tier.id)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        active ? "border-gold" : "border-forest-200"
                      }`}
                      aria-hidden="true"
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-gold" />}
                    </span>
                    <span className="text-[13.5px] font-medium text-content">
                      {tier.specs.area}
                    </span>
                  </span>
                  {siteConfig.showPrices && (
                    <span className="font-mono text-[13.5px] font-semibold tabular-nums text-content">
                      {formatBaht(tier.price)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="mt-1.5 text-[12px] text-ink-muted">{t("demoAreaHint")}</p>
        </fieldset>
      )}

      {/* which robot model to demo */}
      <div>
        <label
          htmlFor="demo-robot"
          className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-content"
        >
          <Bot className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {t("demoRobotLabel")}
        </label>
        <select
          id="demo-robot"
          value={robotId}
          onChange={(e) => setRobotId(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
        >
          <option value="" disabled>
            {t("selectRobotPlaceholder")}
          </option>
          {robots.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {!robotId && (
          <p className="mt-1.5 text-[12px] text-ink-muted">{t("demoRobotHint")}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <AddToCartButton
          productId={tierId}
          forId={robotId}
          disabled={!robotId || !tierId}
        />
      </div>
    </div>
  );
}
