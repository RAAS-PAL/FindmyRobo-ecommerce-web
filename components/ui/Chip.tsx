import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Class for a selectable option, for elements that cannot use <Chip>. */
export function chipClass({
  selected = false,
  onDark = false,
  className = "",
}: {
  selected?: boolean;
  onDark?: boolean;
  className?: string;
} = {}) {
  const base =
    "inline-flex h-9 cursor-pointer items-center gap-2 rounded-control border px-3 text-small font-medium transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.97]";
  const state = selected
    ? "border-accent bg-accent text-on-accent"
    : onDark
      ? "border-white/20 text-white hover:border-white/50"
      : "border-forest-100 text-content hover:border-forest-300";
  return `${base} ${state}${className ? ` ${className}` : ""}`;
}

/** A selectable option: the technology block's parts, finder answers. */
export default function Chip({
  selected = false,
  onDark = false,
  className = "",
  children,
  ...button
}: {
  selected?: boolean;
  onDark?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button type="button" aria-pressed={selected} className={chipClass({ selected, onDark, className })} {...button}>
      {children}
    </button>
  );
}
