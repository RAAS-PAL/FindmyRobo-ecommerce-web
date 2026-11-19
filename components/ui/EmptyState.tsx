import type { ReactNode } from "react";

/**
 * "Nothing here": a title, one line that says what to do (never how the
 * interface works), and at most one action. No icon, no box.
 */
export default function EmptyState({
  title,
  body,
  action,
  as: Heading = "h2",
}: {
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Heading className="text-heading text-content">{title}</Heading>
      {body && <p className="mt-2 text-small text-ink-muted">{body}</p>}
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-4">{action}</div>}
    </div>
  );
}
