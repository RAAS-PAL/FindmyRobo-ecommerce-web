"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import QuoteForm from "@/components/quote/QuoteForm";
import LineChatButton from "@/components/quote/LineChatButton";

/** Why buy here rather than import — the About page's approved promises, shortened. */
const PROMISES = ["warranty", "install", "aftersales"] as const;

/**
 * The hero's quote card, and under it the three promises and a LINE shortcut
 * for people who would rather chat. Those fold away while the card is open,
 * so the form has the room it grows into. From lg it floats over the hero
 * photo, so the notes sit on their own frosted panel rather than on the photo.
 */
export default function HeroQuote({
  onOpenChange,
}: {
  /** Told when the card opens or closes (the hero pauses its slides meanwhile). */
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("heroQuote");
  const [formOpen, setFormOpen] = useState(false);
  // stable, so QuoteForm's outside-click listener isn't re-bound every render
  const onExpandedChange = useCallback(
    (open: boolean) => {
      setFormOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  return (
    <div className="flex flex-col items-center lg:items-end">
      <QuoteForm onExpandedChange={onExpandedChange} />

      <div
        // z-30: above the card (z-20), so the QR popover can rise over it
        className={`relative z-30 grid w-[17.5rem] max-w-[calc(100vw-2rem)] transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          formOpen ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
        }`}
        inert={formOpen ? true : undefined}
      >
        {/* overflow-visible while shown, so the popover isn't clipped */}
        <div className={formOpen ? "overflow-hidden" : "overflow-visible"}>
          <div className="mt-3 rounded-2xl border border-black/5 bg-surface/80 px-4 py-3.5 backdrop-blur-md dark:border-white/10">
            <ul aria-label={t("promisesLabel")} className="space-y-2">
              {PROMISES.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2.5 text-[13px] leading-snug font-semibold text-content"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-forest-950">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {t(`promises.${key}`)}
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-black/8 pt-3 dark:border-white/10">
              <LineChatButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
