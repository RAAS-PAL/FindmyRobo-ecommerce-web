"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ProductVisual from "@/components/ui/ProductVisual";
import { useCart } from "@/components/cart/CartProvider";
import { formatBaht } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const tq = useTranslations("quotation");
  // In quotation mode the drawer is a list of things to be quoted, not a cart.
  const drawerTitle = siteConfig.showPrices ? t("title") : tq("listTitle");
  const { items, count, subtotal, remove, setQty, drawerOpen, closeDrawer } = useCart();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[92%] max-w-md flex-col bg-forest-950 shadow-2xl"
            role="dialog"
            aria-label={drawerTitle}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-forest-950">
                  <ShoppingCart className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span className="font-display text-base font-extrabold text-white">
                  {drawerTitle}
                  {count > 0 && (
                    <span className="ml-2 font-mono text-sm font-semibold text-gold">
                      ({count})
                    </span>
                  )}
                </span>
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={t("close")}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 ? (
              /* empty state */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <ShoppingCart className="h-7 w-7 text-white/30" aria-hidden="true" />
                </span>
                <p className="text-sm leading-relaxed text-white/60">{t("empty")}</p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-gold px-7 text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)]"
                >
                  {t("emptyCta")}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                {/* line items */}
                <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-5">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-4 py-5">
                      <Link
                        href={`/products/${item.id}`}
                        onClick={closeDrawer}
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-2"
                      >
                        <ProductVisual
                          product={item.product}
                          className="h-full w-auto"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.id}`}
                            onClick={closeDrawer}
                            className="font-display text-[13.5px] font-bold leading-snug text-white transition-colors hover:text-gold"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(item.key)}
                            aria-label={t("removeItem", { name: item.product.name })}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        {item.forProduct && (
                          <p className="mt-0.5 text-[11.5px] font-medium text-gold/90">
                            {t("forRobot", { name: item.forProduct.name })}
                          </p>
                        )}
                        {siteConfig.showPrices && (
                          <p className="mt-0.5 text-[12px] text-white/50">
                            {formatBaht(item.product.price)}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 rounded-full border border-white/15">
                            <button
                              type="button"
                              onClick={() => setQty(item.key, item.qty - 1)}
                              aria-label={t("qtyDecrease")}
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-gold"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="w-6 text-center font-mono text-sm font-semibold tabular-nums text-white">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(item.key, item.qty + 1)}
                              aria-label={t("qtyIncrease")}
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-gold"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          {siteConfig.showPrices && (
                            <span className="font-mono text-[15px] font-semibold tabular-nums text-gold">
                              {formatBaht(item.qty * item.product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* footer */}
                <div className="border-t border-white/10 p-5">
                  {siteConfig.showPrices ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-white/70">
                          {t("subtotal")}
                        </span>
                        <span className="font-mono text-xl font-semibold tabular-nums text-white">
                          {formatBaht(subtotal)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-white/40">{t("shippingNote")}</p>
                    </>
                  ) : (
                    // Quotation mode: a subtotal would imply a price we have not
                    // quoted yet, so state what actually happens next instead.
                    <p className="text-[12.5px] leading-relaxed text-white/50">
                      {tq("totalPending")}
                    </p>
                  )}
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="mt-4 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)]"
                  >
                    {siteConfig.showPrices ? t("checkout") : tq("submitCta")}
                    <ArrowUpRight className="h-4.5 w-4.5" aria-hidden="true" />
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
