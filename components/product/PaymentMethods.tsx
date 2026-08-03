import type { ReactNode } from "react";

/**
 * "Accepted payment methods" trust row on product pages. Card brands are inline
 * SVG marks (no external requests); PromptPay and Bank transfer use the store's
 * own logo files in /public/payments/. White badge cards so every logo reads on
 * both light and dark backgrounds.
 */

function Visa() {
  return (
    <svg viewBox="0 0 48 16" className="h-3" role="img" aria-label="Visa">
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="0.5"
        fill="#1434CB"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 34 22" className="h-4" role="img" aria-label="Mastercard">
      <circle cx="13" cy="11" r="8" fill="#EB001B" />
      <circle cx="21" cy="11" r="8" fill="#F79E1B" />
      <path d="M17 4.6a8 8 0 0 1 0 12.8 8 8 0 0 1 0-12.8Z" fill="#FF5F00" />
    </svg>
  );
}

function UnionPay() {
  return (
    <svg viewBox="0 0 40 22" className="h-4" role="img" aria-label="UnionPay">
      <g transform="skewX(-10)">
        <rect x="9" y="3" width="8" height="16" rx="2" fill="#E21836" />
        <rect x="16" y="3" width="8" height="16" rx="2" fill="#00447C" />
        <rect x="23" y="3" width="8" height="16" rx="2" fill="#007B84" />
      </g>
    </svg>
  );
}

interface Method {
  label: string;
  svg?: ReactNode;
  /** Logo file in /public (used for PromptPay / Bank transfer). */
  img?: string;
}

const METHODS: Method[] = [
  { label: "Visa", svg: <Visa /> },
  { label: "Mastercard", svg: <Mastercard /> },
  { label: "UnionPay", svg: <UnionPay /> },
  { label: "PromptPay", img: "/payments/PromptPay-logo.png" },
  { label: "Bank transfer", img: "/payments/BankTransfer_logo_1200x600.png" },
];

export default function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="img"
      aria-label="Accepted payment methods"
    >
      {METHODS.map(({ label, svg, img }) => (
        <span
          key={label}
          title={label}
          className="inline-flex h-7 items-center justify-center rounded-md border border-forest-100 bg-white px-2.5"
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={label} loading="lazy" className="h-5 w-auto object-contain" />
          ) : (
            svg
          )}
        </span>
      ))}
    </div>
  );
}
