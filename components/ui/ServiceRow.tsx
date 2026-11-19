import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * A service (installation, a demo at home) in the shop: not a robot, so not
 * a robot card. A row with its name and one line; the whole row is the link.
 * No photo.
 */
export default function ServiceRow({
  href,
  name,
  line,
  action,
}: {
  href: string;
  name: string;
  line: string;
  /** The link's words, e.g. "See details". */
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-6 border-t border-forest-100 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="min-w-0">
        <h3 className="text-heading text-content">{name}</h3>
        <p className="mt-1 text-small text-ink-muted">{line}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-small font-semibold text-accent-600 underline-offset-4 group-hover:underline">
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
