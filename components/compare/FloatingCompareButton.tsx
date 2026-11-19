"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useCompare } from "@/components/compare/CompareProvider";
import ComparePanel from "@/components/compare/ComparePanel";
import { buttonClass } from "@/components/ui/Button";

/**
 * The compare bar: nothing on screen until a robot has been added for
 * comparison (Add to comparison on a robot's page), then one plain button,
 * "Compare 2 robots", in the bottom-right corner that opens the picker
 * (ComparePanel). On a product page it sits above the page's sticky quote
 * bar. Hidden during checkout so nothing floats over the payment form.
 */
export default function FloatingCompareButton() {
  const t = useTranslations("compare");
  const pathname = usePathname();
  const { count } = useCompare();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/checkout")) return null;
  const onProductPage = pathname.startsWith("/products/");

  return (
    <>
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonClass({
            variant: "secondary",
            className: `fixed right-4 z-40 bg-surface shadow-float sm:right-6 ${
              onProductPage ? "bottom-24" : "bottom-6"
            }`,
          })}
        >
          {t("floating.label", { count })}
        </button>
      )}
      <ComparePanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
