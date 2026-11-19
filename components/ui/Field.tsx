import type { ReactNode } from "react";

/** Every input, select and textarea on the storefront. */
export const fieldControlClass =
  "h-12 w-full rounded-control border border-forest-100 bg-surface px-3.5 text-body text-content placeholder:text-forest-300 focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none aria-invalid:border-red-600";
/** A textarea: the field look without the fixed height. */
export const fieldAreaClass = fieldControlClass.replace("h-12 ", "min-h-24 py-3 ");
export const fieldLabelClass = "mb-1.5 block text-small font-medium text-content";
export const fieldErrorClass = "mt-1.5 text-small text-red-600 dark:text-red-400";

/**
 * A label above its control, and an error under it. The control is passed in
 * so any input, select or textarea fits; give it `fieldControlClass`.
 */
export default function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor: string;
  error?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={fieldLabelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={fieldErrorClass}>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-small text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
