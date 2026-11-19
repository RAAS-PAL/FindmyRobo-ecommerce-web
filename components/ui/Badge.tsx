import type { ReactNode } from "react";

/**
 * A short status on a card or product: "Preorder", "Brand-new",
 * "Pre-owned". Sentence case. `solid` is for Preorder only.
 */
export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "solid" | "onPhoto";
  className?: string;
}) {
  const tones = {
    neutral: "bg-forest-100 text-content",
    solid: "bg-content text-surface",
    onPhoto: "bg-white/15 text-white",
  } as const;
  return (
    <span
      className={`inline-flex h-6 items-center rounded-control px-2 text-caption font-semibold whitespace-nowrap ${tones[tone]}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </span>
  );
}
