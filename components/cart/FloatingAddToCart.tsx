"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatBaht } from "@/data/products";

/**
 * Sticky Add-to-Cart bar for the product page. It stays hidden while the primary
 * button is on screen and slides up from the bottom once that button has scrolled
 * out the top of the viewport — so the customer can always add to cart while
 * reading specs, photos, or the detail sections further down. Mirrors
 * AddToCartButton's behaviour (add one, open the drawer, brief "Added" state).
 *
 * `anchorId` is the id of the element wrapping the primary button; visibility is
 * driven by an IntersectionObserver on it, not a scroll listener, so it stays
 * cheap and accurate on resize/zoom.
 */
export default function FloatingAddToCart({
  productId,
  name,
  price,
  anchorId,
}: {
  productId: string;
  name: string;
  price: number;
  anchorId: string;
}) {
  const t = useTranslations("cart");
  const { add, openDrawer } = useCart();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show only once the primary button has left past the TOP of the screen,
        // so scrolling back up to it hides the bar again.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleClick = () => {
    add(productId, 1);
    openDrawer();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-forest-100 bg-surface/95 backdrop-blur-lg transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-content sm:text-sm">
            {name}
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-content">
            {formatBaht(price)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          tabIndex={visible ? 0 : -1}
          className="flex min-h-[48px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 text-[14px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)] sm:px-8"
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
      </div>
    </div>
  );
}
