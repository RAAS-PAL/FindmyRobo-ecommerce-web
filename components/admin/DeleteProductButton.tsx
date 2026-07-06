"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      window.alert(data?.error ?? "Could not delete product.");
    } catch {
      window.alert("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
