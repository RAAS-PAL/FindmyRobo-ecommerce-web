import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * The storefront's only button. One shape, two sizes, four variants:
 *   primary   the one main action of a block (at most one per block)
 *   secondary a second action on a light surface
 *   onPhoto   a second action on a photo or a dark surface
 *   quiet     a low-weight action inside a panel
 * Text only: no icons, no arrows. Answers a press at once (scale 0.97).
 * With `href` it renders a link (the locale-aware Link for site paths, a
 * plain <a> for http:, mailto: and tel:).
 */
export type ButtonVariant = "primary" | "secondary" | "onPhoto" | "quiet";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex cursor-pointer items-center justify-center rounded-control font-semibold whitespace-nowrap select-none transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-small",
  lg: "h-12 px-6 text-body",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong",
  secondary: "border border-forest-300 text-content hover:border-content",
  onPhoto: "border border-white/50 text-white hover:border-white hover:bg-white/10",
  quiet: "text-accent-600 hover:bg-accent-50",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}${fullWidth ? " w-full" : ""}${className ? ` ${className}` : ""}`;
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };
type AsLink = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & { href: string };

const EXTERNAL = /^(https?:|mailto:|tel:)/;

export default function Button(props: AsButton | AsLink) {
  const { variant, size, fullWidth, className, children, ...rest } = props;
  const cls = buttonClass({ variant, size, fullWidth, className });
  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as Omit<AsLink, keyof Common>;
    if (EXTERNAL.test(href)) {
      return (
        <a href={href} className={cls} {...anchor}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...anchor}>
        {children}
      </Link>
    );
  }
  const { type = "button", ...button } = rest as Omit<AsButton, keyof Common>;
  return (
    <button type={type} className={cls} {...button}>
      {children}
    </button>
  );
}
