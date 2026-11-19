import type { ReactNode } from "react";

/**
 * The one small label left on the storefront: a fact about the thing below
 * it, such as brand and category ("Mammotion · Lawn mowers"). Sentence case,
 * no letter-spacing, no dot or icon before it. Never a label that names the
 * section ("Who we are", "The lineup").
 */
export default function MetaLine({
  children,
  onPhoto = false,
  className = "",
}: {
  children: ReactNode;
  onPhoto?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-caption font-medium ${onPhoto ? "text-white/80" : "text-ink-muted"}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </p>
  );
}
