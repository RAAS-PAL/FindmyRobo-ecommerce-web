import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

// -my-3 py-3: a 44px-tall tap target around a 21px line, without moving the
// layout around it.
const CLASS =
  "-my-3 inline-flex items-center gap-1 py-3 text-small font-semibold underline-offset-4 hover:underline";

/**
 * A link that reads as an action ("View all robots", "Find yours"). The
 * arrow does not move. Site paths use the locale-aware Link; http:, mailto:
 * and tel: open as plain links (http: in a new tab).
 */
export default function TextLink({
  href,
  children,
  className = "",
  onPhoto = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** On a photo or dark surface: white text. */
  onPhoto?: boolean;
}) {
  const cls = `${CLASS} ${onPhoto ? "text-white" : "text-accent-600"}${className ? ` ${className}` : ""}`;
  const body = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </>
  );
  if (/^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  if (/^(mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
