"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import QuoteForm from "@/components/quote/QuoteForm";
import { useQuote } from "@/components/quote/QuoteProvider";
import { useProducts } from "@/components/ProductsProvider";
import { isDemoService } from "@/data/products";

/**
 * The quote form as a side panel — where every "interested" button lands while
 * the cart is switched off (siteConfig.cartEnabled). Slides in from the right
 * like the cart drawer did, with the button's product already selected.
 */
export default function QuoteDrawer() {
  const t = useTranslations("heroQuote");
  const { target, closeQuote } = useQuote();
  const panelRef = useRef<HTMLElement>(null);
  const open = target !== null;
  const { getProduct } = useProducts();
  // Request a Demo's Book Now opens this too: then it is a booking, not a quote.
  const title =
    target?.productId && isDemoService(getProduct(target.productId)) ? t("demoTitle") : t("eyebrow");

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeQuote();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeQuote]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeQuote}
            className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm reduced-transparency:bg-forest-950/85 reduced-transparency:backdrop-blur-none"
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[92%] max-w-md flex-col bg-surface shadow-2xl focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-forest-100 px-5 py-4">
              <h2 className="font-display text-heading text-content">{title}</h2>
              <button
                type="button"
                onClick={closeQuote}
                aria-label={t("closePanel")}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-control text-ink-muted transition-[background-color,color,scale] duration-150 hover:bg-cloud hover:text-content active:scale-[0.97]"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* keyed so opening it for another product starts a fresh form */}
              <QuoteForm
                key={`${target.productId ?? ""}:${target.forId ?? ""}:${target.interest ?? ""}`}
                variant="panel"
                productId={target.productId}
                forId={target.forId}
                interest={target.interest}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
