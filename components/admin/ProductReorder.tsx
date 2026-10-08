"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, GripVertical, LoaderCircle, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Product } from "@/data/products";
import ProductVisual from "@/components/ui/ProductVisual";

export default function ProductReorder({ products }: { products: Product[] }) {
  const router = useRouter();
  const t = useTranslations("admin.reorder");
  const tc = useTranslations("categories");
  const [items, setItems] = useState(products);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setSaved(false);
  };

  const dropBefore = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = items.findIndex((item) => item.id === draggedId);
    const to = items.findIndex((item) => item.id === targetId);
    move(from, from < to ? to - 1 : to);
    setDraggedId(null);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/products/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((item) => item.id) }),
      });
      if (!response.ok) throw new Error(t("saveError"));
      setSaved(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("saveError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8">
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <ol className="space-y-2" aria-label={t("listLabel")}>
        {items.map((product, index) => (
          <li
            key={product.id}
            draggable
            onDragStart={(event) => {
              setDraggedId(product.id);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", product.id);
            }}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              dropBefore(product.id);
            }}
            className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 transition ${
              draggedId === product.id
                ? "border-accent opacity-50"
                : "border-forest-100 hover:border-accent/60"
            }`}
          >
            <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-ink-muted active:cursor-grabbing" aria-hidden="true" />
            <span className="w-7 shrink-0 text-center font-mono text-xs font-semibold text-ink-muted">
              {index + 1}
            </span>
            <span className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cloud p-1">
              <ProductVisual product={product} className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-content">{product.name}</span>
              <span className="mt-0.5 block truncate text-xs text-ink-muted">
                {tc(`${product.category}.name`)}
              </span>
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label={t("moveUp", { name: product.name })}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label={t("moveDown", { name: product.name })}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-4 rounded-2xl border border-forest-100 bg-surface/90 p-4 shadow-lg backdrop-blur-xl">
        {saved && <p className="text-sm font-semibold text-forest">{t("saved")}</p>}
        <button
          type="button"
          onClick={save}
          disabled={busy || items.length === 0}
          className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-7 text-sm font-bold text-on-accent transition-shadow hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {busy ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
