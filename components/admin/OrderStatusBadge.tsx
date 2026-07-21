import type { OrderStatus } from "@/lib/checkout";

/**
 * Presentational status pill shared by the admin order list and detail view.
 * Semi-transparent fills so the same classes read correctly in both the light
 * and dark admin themes. Pure — the translated label is passed in by the caller.
 */
const STATUS_CLASS: Record<OrderStatus, string> = {
  pending_payment: "bg-gold/15 text-gold-600 border-gold/30",
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  failed: "bg-red-500/15 text-red-600 border-red-500/30",
  expired: "bg-ink-muted/10 text-ink-muted border-ink-muted/30",
  cancelled: "bg-ink-muted/10 text-ink-muted border-ink-muted/30",
  refunded: "bg-blue-500/15 text-blue-600 border-blue-500/30",
};

export default function OrderStatusBadge({
  status,
  label,
  className = "",
}: {
  status: OrderStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${STATUS_CLASS[status]} ${className}`}
    >
      {label}
    </span>
  );
}
