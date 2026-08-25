"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useConfirm } from "@/components/admin/ConfirmProvider";

export default function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const t = useTranslations("admin.deleteProduct");
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("confirmTitle"),
      message: t("confirm", { name }),
      confirmLabel: t("confirmButton"),
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
        return;
      }
      window.alert(t("failed"));
    } catch {
      window.alert(t("network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={t("label", { name })}
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
