"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";

export interface RobotOption {
  id: string;
  name: string;
}

/**
 * Purchase panel for service products (installation, demo). The customer must
 * choose which robot the service is for before it can be added to the cart —
 * that choice travels with the cart line (forId).
 */
export default function ServicePurchasePanel({
  serviceId,
  robots,
}: {
  serviceId: string;
  robots: RobotOption[];
}) {
  const t = useTranslations("service");
  const [robotId, setRobotId] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="service-robot"
          className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-forest"
        >
          <Bot className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {t("selectRobotLabel")}
        </label>
        <select
          id="service-robot"
          value={robotId}
          onChange={(e) => setRobotId(e.target.value)}
          className="min-h-[48px] w-full rounded-xl border border-forest-100 bg-white px-4 text-[14px] text-forest transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
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
