"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export default function AddToCartButton({ productId }: { productId: string }) {
  const t = useTranslations("cart");
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
    add(productId);
    openDrawer();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-h-[52px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-7 text-[15px] font-bold text-navy-950 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)]"
    >
      {added ? (
        <>
          <Check className="h-4.5 w-4.5" aria-hidden="true" />
          {t("added")}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
          {t("addToCart")}
        </>
      )}
    </button>
  );
}
