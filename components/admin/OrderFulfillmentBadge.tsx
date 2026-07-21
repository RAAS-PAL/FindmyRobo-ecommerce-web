import type { OrderFulfillment } from "@/lib/checkout";

/**
 * Presentational fulfilment-status pill for the admin order list + detail view.
 * Mirrors OrderStatusBadge (semi-transparent fills that read in both themes).
 * `status` undefined = not yet sent to the warehouse.
 */
type FulfillmentStatus = NonNullable<OrderFulfillment["status"]>;

const STATUS_CLASS: Record<FulfillmentStatus, string> = {
  created: "bg-gold/15 text-gold-600 border-gold/30",
  picked: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  packed: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  shipped: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  cancelled: "bg-ink-muted/10 text-ink-muted border-ink-muted/30",
};

export default function OrderFulfillmentBadge({
  status,
  label,
  className = "",
}: {
  status: FulfillmentStatus;
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
