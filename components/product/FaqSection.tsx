"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FaqItem, Locale } from "@/data/products";
import { EASE_OUT } from "@/lib/motion";

/**
 * Product FAQ accordion (admin-editable via the page builder, stored on
 * product.page.faqs). Single-open: clicking a question opens it and closes the
 * previous one; the first item starts open. Content is bilingual.
 */
export default function FaqSection({
  faqs,
  heading,
  locale,
}: {
  faqs: FaqItem[];
  heading: string;
  locale: Locale;
}) {
  const pick = (t: { en: string; th: string }) => t[locale] || t.en;
  const [open, setOpen] = useState<number | null>(0);

  // Rows divided by hairlines, the question in the row, a chevron that turns.
  return (
    <section className="max-w-4xl">
      <h2 className="font-display text-title text-content">{heading}</h2>
      <div className="mt-8 border-b border-forest-100">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border-t border-forest-100">
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-body font-semibold text-content">{pick(item.question)}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ease-out ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-6 whitespace-pre-line text-body text-ink-muted">{pick(item.answer)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
