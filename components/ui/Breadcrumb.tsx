import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * The one breadcrumb, on both kinds of product page: Home › Products ›
 * category › the robot (the full-screen page used to start at "Shop").
 *
 * Each chevron belongs to the step after it, inside one unbreakable item, so
 * when the trail wraps on a phone the new line starts with "› Robot" instead
 * of the old line ending on a lone "›".
 */
export default function Breadcrumb({
  label,
  items,
  onPhoto = false,
  className = "",
}: {
  /** The trail's accessible name ("Breadcrumb"). */
  label: string;
  /** Every step but the last is a link; the last is the current page. */
  items: { label: string; href?: string }[];
  /** On a dark photo header: white text instead of muted ink. */
  onPhoto?: boolean;
  className?: string;
}) {
  const link = onPhoto ? "text-white/70 hover:text-white" : "text-ink-muted hover:text-accent-600";
  const current = onPhoto ? "text-white" : "font-medium text-content";
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-small">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="inline-flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 ${onPhoto ? "text-white/50" : "text-ink-muted"}`}
                  aria-hidden="true"
                />
              )}
              {last || !item.href ? (
                <span className={current} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={`whitespace-nowrap transition-colors ${link}`}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
