"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, Ruler } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import PriceOrQuote from "@/components/ui/PriceOrQuote";
import { useCart } from "@/components/cart/CartProvider";
import { useProducts } from "@/components/ProductsProvider";
import { SERVICE_CATEGORY } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { installTiers, recommendedTier } from "@/lib/installTiers";

/**
 * Purchase panel for installation. Two choices, in this order:
 *
 *   1. WHICH ROBOT — listed from the quotation list, not the catalogue. An
 *      installation attaches to a machine the customer is actually getting, so
 *      offering catalogue robots would let them request installation for
 *      something they never asked us to supply. (A demo is the opposite case:
 *      it is aimed at someone still deciding, so DemoPurchasePanel lists the
 *      whole catalogue.)
 *
 *   2. WHICH COVERAGE AREA — each band is its own product, so picking one
 *      decides which product joins the quotation. Choosing a robot preselects
 *      the smallest band that covers it, which is right far more often than
 *      not, while leaving the customer free to size up.
 */
export default function InstallPurchasePanel({ currentId }: { currentId: string }) {
  const t = useTranslations("service");
  const tq = useTranslations("quotation");
  const { items } = useCart();
  const { products } = useProducts();

  const tiers = useMemo(() => installTiers(products), [products]);

  // Distinct robots in the quotation list — or, with the cart switched off,
  // every robot in the catalogue. A service can't be installed onto another
  // service.
  const robots = useMemo(
    () =>
      siteConfig.cartEnabled
        ? items
            .filter((line) => line.product.category !== SERVICE_CATEGORY)
            .map((line) => line.product)
            .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        : products.filter((p) => p.category !== SERVICE_CATEGORY),
    [items, products]
  );

  const [robotId, setRobotId] = useState("");
  const [tierId, setTierId] = useState(() =>
    tiers.some((x) => x.id === currentId) ? currentId : tiers[0]?.id ?? currentId
  );
  // Set once the customer overrides the suggestion, so re-picking a robot
  // doesn't quietly undo their choice.
  const [tierTouched, setTierTouched] = useState(false);

  const selectedRobot = robots.find((r) => r.id === robotId);
  const suggestedId = recommendedTier(selectedRobot, tiers)?.id;

  useEffect(() => {
    if (!robotId || tierTouched || !suggestedId) return;
    setTierId(suggestedId);
  }, [robotId, suggestedId, tierTouched]);

  const selectedTier = tiers.find((x) => x.id === tierId);

  /* No robot in the quotation list yet — installation has nothing to attach to,
     so send them to pick a machine first rather than accepting a dead request. */
  if (robots.length === 0) {
    return (
      <div className="rounded-2xl border border-forest-100 bg-cloud/60 p-5 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold/20">
          <Bot className="h-5 w-5 text-gold-600" aria-hidden="true" />
        </span>
        <p className="mt-3 text-[13.5px] font-semibold text-content">
          {t("noRobotsTitle")}
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
          {t("noRobotsBody")}
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-6 text-[13.5px] font-bold text-forest-950 transition-transform duration-300 hover:scale-[1.02]"
        >
          {t("noRobotsCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {selectedTier && siteConfig.showPrices && (
        <PriceOrQuote
          amount={selectedTier.price}
          className="font-mono text-3xl font-semibold tabular-nums text-content"
        />
      )}

      {/* 1. robot */}
      <div>
        <label
          htmlFor="install-robot"
          className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-content"
        >
          <Bot className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {t("selectRobotLabel")}
        </label>
        <select
          id="install-robot"
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
          <p className="mt-1.5 text-[12px] text-ink-muted">{t("selectRobotHint")}</p>
        )}
      </div>

      {/* 2. coverage area */}
      {tiers.length > 0 && (
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-content">
            <Ruler className="h-4 w-4 text-gold-600" aria-hidden="true" />
            {t("selectAreaLabel")}
          </legend>
          <div className="flex flex-col gap-2">
            {tiers.map((tier) => {
              const checked = tier.id === tierId;
              const suggested = tier.id === suggestedId && !!robotId;
              return (
                <label
                  key={tier.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    checked
                      ? "border-gold bg-gold/10"
                      : "border-forest-100 hover:border-gold/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="install-tier"
                      value={tier.id}
                      checked={checked}
                      onChange={() => {
                        setTierId(tier.id);
                        setTierTouched(true);
                      }}
                      className="h-4 w-4 shrink-0 accent-gold"
                    />
                    <span>
                      <span className="block text-[13.5px] font-semibold text-content">
                        {tier.specs.area}
                      </span>
                      {suggested && (
                        <span className="mt-0.5 block font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                          {t("recommendedForRobot")}
                        </span>
                      )}
                    </span>
                  </span>
                  {siteConfig.showPrices && (
                    <span className="font-mono text-[13.5px] font-semibold tabular-nums text-content">
                      <PriceOrQuote amount={tier.price} />
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {!siteConfig.showPrices && (
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              {tq("note")}
            </p>
          )}
        </fieldset>
      )}

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
