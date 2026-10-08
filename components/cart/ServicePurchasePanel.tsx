"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useCart } from "@/components/cart/CartProvider";
import { useProducts } from "@/components/ProductsProvider";
import { SERVICE_CATEGORY } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";

/**
 * Purchase panel for service products (installation, demo). PRD #31: the
 * service must attach to a robot the customer is actually buying, so the picker
 * lists the robots currently in the cart (not the whole catalog). The choice
 * travels with the cart line via `forId`. If there's no robot in the cart yet,
 * we prompt the shopper to add one first instead of letting them attach the
 * service to nothing. With the cart switched off there is no cart to read, so
 * the picker lists every robot in the catalogue.
 */
export default function ServicePurchasePanel({ serviceId }: { serviceId: string }) {
  const t = useTranslations("service");
  const { items } = useCart();
  const { products } = useProducts();
  const [robotId, setRobotId] = useState("");

  // Distinct robots in the cart (a service can't be installed onto a service).
  const robots = siteConfig.cartEnabled
    ? items
        .filter((line) => line.product.category !== SERVICE_CATEGORY)
        .map((line) => ({ id: line.product.id, name: line.product.name }))
        .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    : products
        .filter((p) => p.category !== SERVICE_CATEGORY)
        .map((p) => ({ id: p.id, name: p.name }));

  if (robots.length === 0) {
    return (
      <div className="rounded-2xl border border-forest-100 bg-cloud/60 p-5 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent/20">
          <Bot className="h-5 w-5 text-accent-600" aria-hidden="true" />
        </span>
        <p className="mt-3 text-[13.5px] font-semibold text-content">{t("noRobotsTitle")}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{t("noRobotsBody")}</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 text-[13.5px] font-bold text-on-accent transition-transform duration-300 hover:scale-[1.02]"
        >
          {t("noRobotsCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="service-robot"
          className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-content"
        >
          <Bot className="h-4 w-4 text-accent-600" aria-hidden="true" />
          {t("selectRobotLabel")}
        </label>
        <select
          id="service-robot"
          value={robotId}
          onChange={(e) => setRobotId(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <AddToCartButton productId={serviceId} forId={robotId} disabled={!robotId} />
      </div>
    </div>
  );
}
