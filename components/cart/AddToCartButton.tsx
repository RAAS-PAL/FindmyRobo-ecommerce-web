"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import CartIcon from "@/components/cart/CartIcon";
import { useCart } from "@/components/cart/CartProvider";
import { siteConfig } from "@/data/siteConfig";

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
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleClick = () => {
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
      className="flex min-h-[52px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-7 text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
    >
      {added ? (
        <>
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
          {t("added")}
        </>
      ) : (
        <>
          {icon ?? <CartIcon className="h-4.5 w-4.5" />}
          {label ?? (siteConfig.showPrices ? t("addToCart") : tq("addToList"))}
        </>
      )}
    </button>
  );
}
