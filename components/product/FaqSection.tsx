"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FaqItem, Locale } from "@/data/products";

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

  return (
    <section className="mx-auto max-w-4xl">
      <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
        {heading}
      </h2>
      <div className="mt-10 rounded-3xl bg-cloud p-2 sm:p-3">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={
                isOpen
                  ? "my-1 rounded-2xl border border-forest-200 bg-surface"
                  : "border-b border-forest-100/70 last:border-b-0"
              }
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl px-4 py-5 text-left sm:px-6"
                >
                  <span className="text-[15.5px] font-bold leading-snug text-content sm:text-[17px]">
                    {pick(item.question)}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen ? "bg-forest-950 text-white" : "bg-surface text-content"
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="whitespace-pre-line px-4 pb-6 text-[15px] leading-relaxed text-ink-muted sm:px-6">
                      {pick(item.answer)}
                    </p>
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
