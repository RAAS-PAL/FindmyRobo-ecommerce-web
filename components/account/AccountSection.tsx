/** Card shell shared by the account settings sections. */
export default function AccountSection({
  eyebrow,
  heading,
  sub,
  headingId,
  tone = "default",
  children,
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
  headingId: string;
  /** "danger" tints the border red for destructive actions. */
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border bg-surface p-5 sm:p-6 ${
        tone === "danger" ? "border-red-200" : "border-forest-100"
      }`}
    >
      <p
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${
          tone === "danger" ? "text-red-600" : "text-gold-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mt-1 font-display text-xl font-extrabold text-content"
      >
        {heading}
      </h2>
      {sub && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
