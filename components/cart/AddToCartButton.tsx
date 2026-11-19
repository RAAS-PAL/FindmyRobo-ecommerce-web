"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import CartIcon from "@/components/cart/CartIcon";
import { useCart } from "@/components/cart/CartProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import { siteConfig } from "@/data/siteConfig";
import { buttonClass } from "@/components/ui/Button";

/**
 * The product's main "I'm interested" button. With the cart on it adds the
 * product and opens the cart; with it off (siteConfig.cartEnabled) it opens the
 * quote form with this product — and its robot, for a service — selected.
 */
export default function AddToCartButton({
  productId,
  forId,
  disabled = false,
  label,
  icon,
}: {
  productId: string;
  /** For service products: the robot this service is attached to. */
  forId?: string;
  disabled?: boolean;
  /** Overrides the default cart/quotation wording — e.g. "Book Now" for a demo. */
  label?: string;
  /** Overrides the cart icon when the action isn't really "add to cart". */
  icon?: React.ReactNode;
}) {
  const t = useTranslations("cart");
  const tq = useTranslations("quotation");
  const { add, openDrawer } = useCart();
  const { openQuote } = useQuote();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleClick = () => {
    if (!siteConfig.cartEnabled) {
      openQuote({ productId, forId });
      return;
    }
    add(productId, 1, forId);
    openDrawer();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={buttonClass({ size: "lg", className: "gap-2 sm:flex-1" })}
    >
      {added ? (
        <>
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
          {t("added")}
        </>
      ) : (
        <>
          {/* quote mode: text only, like every other button */}
          {siteConfig.cartEnabled && (icon ?? <CartIcon className="h-4.5 w-4.5" />)}
          {label ??
            (!siteConfig.cartEnabled
              ? tq("requestCta")
              : siteConfig.showPrices
                ? t("addToCart")
                : tq("addToList"))}
        </>
      )}
    </button>
  );
}
