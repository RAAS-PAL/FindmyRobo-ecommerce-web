import type { ReactNode } from "react";

/** The top of every page below the homepage: its name and one line. */
export default function PageHeader({
  title,
  lead,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  /** Anything that belongs to the header, e.g. a search field. */
  children?: ReactNode;
}) {
  return (
    <header className="bg-surface pt-12 pb-10 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-display text-content">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lead text-ink-muted">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
