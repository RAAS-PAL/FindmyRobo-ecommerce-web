import type { ReactNode } from "react";

/**
 * A section's heading: the title, an optional one-line lead, an optional
 * action on the right (a TextLink or carousel arrows). Left-aligned, no
 * label above the title.
 */
export default function SectionHeader({
  title,
  lead,
  action,
  as: Heading = "h2",
  onDark = false,
  id,
  className = "",
}: {
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  onDark?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-4${className ? ` ${className}` : ""}`}>
      <div className="max-w-2xl">
        <Heading id={id} className={`font-display text-title ${onDark ? "text-white" : "text-content"}`}>
          {title}
        </Heading>
        {lead && <p className={`mt-3 text-lead ${onDark ? "text-white/70" : "text-ink-muted"}`}>{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
