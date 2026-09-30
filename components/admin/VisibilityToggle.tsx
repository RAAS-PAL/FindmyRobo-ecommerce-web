"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * One-click show/hide for a product on the admin list. Optimistic-free: it
 * waits for the PATCH, then refreshes so the row's badge/dimming reflect the
 * server. A hidden product stays fully in the database — this only flips the
 * storefront flag.
 */
export default function VisibilityToggle({
  id,
  name,
  visible,
}: {
  id: string;
  name: string;
  visible: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("admin.visibility");
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !visible }),
      });
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
      onClick={toggle}
      disabled={busy}
      aria-label={visible ? t("hide", { name }) : t("show", { name })}
      title={visible ? t("hide", { name }) : t("show", { name })}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
        visible
          ? "text-ink-muted hover:bg-accent/15 hover:text-accent-600"
          : "text-accent-600 hover:bg-accent/15"
      }`}
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : visible ? (
        <Eye className="h-4 w-4" aria-hidden="true" />
      ) : (
        <EyeOff className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
