"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import PriceOrQuote from "@/components/ui/PriceOrQuote";
import { siteConfig } from "@/data/siteConfig";

/** Fired on window with `detail: true/false` as the bar shows and hides, so the
 *  navbar can fade its own Get a quote: one way in at a time (Navbar.tsx). */
export const FLOATING_QUOTE_EVENT = "fmr:floating-quote";

/**
 * Sticky Add-to-Cart bar for the product page. It stays hidden while the primary
 * button is on screen and slides up from the bottom once that button has scrolled
 * out the top of the viewport — so the customer can always add to cart while
 * reading specs, photos, or the detail sections further down. Mirrors
 * AddToCartButton's behaviour (add one, open the drawer, brief "Added" state —
 * or, with the cart switched off, open the quote form for this product).
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
  /** null in quotation mode: the price is withheld from the browser. */
  price: number | null;
  anchorId: string;
}) {
  const t = useTranslations("cart");
  const tq = useTranslations("quotation");
  const { add, openDrawer } = useCart();
  const { openQuote } = useQuote();
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

  // Quote mode only: with the cart on, the navbar shows the cart instead.
  useEffect(() => {
    if (siteConfig.cartEnabled) return;
    window.dispatchEvent(new CustomEvent(FLOATING_QUOTE_EVENT, { detail: visible }));
  }, [visible]);
  useEffect(
    () => () => {
      window.dispatchEvent(new CustomEvent(FLOATING_QUOTE_EVENT, { detail: false }));
    },
    []
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handleClick = () => {
    if (!siteConfig.cartEnabled) {
      openQuote({ productId });
      return;
    }
    add(productId, 1);
    openDrawer();
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div
      aria-hidden={!visible}
      // A solid bar: a light translucent layer over a light page only blurs
      // the text under it. It leaves the way it came (down), and with reduced
      // motion it just fades.
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-forest-100 bg-surface transition-[translate,opacity] duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:transition-opacity ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-semibold text-content">{name}</p>
          <PriceOrQuote
            amount={price}
            className="block text-small font-semibold tabular-nums text-content"
            quoteClassName="block text-caption font-medium text-ink-muted"
          />
        </div>
        {/* the storefront's one button, not a pill with a glow and a zoom */}
        <button
          type="button"
          onClick={handleClick}
          tabIndex={visible ? 0 : -1}
          className={buttonClass({ size: "lg", className: "shrink-0 gap-2" })}
        >
          {added ? (
            <>
              <Check className="h-4.5 w-4.5" aria-hidden="true" />
              {t("added")}
            </>
          ) : siteConfig.cartEnabled ? (
            t("addToCart")
          ) : (
            tq("requestCta")
          )}
        </button>
      </div>
    </div>
  );
}
