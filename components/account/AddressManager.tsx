"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, LoaderCircle, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import type { SavedAddress } from "@/lib/addressStore";
import { EMPTY_SHIPPING, validateShipping, type ShippingField } from "@/lib/checkout";

type AddressDraft = Omit<SavedAddress, "id">;

const emptyDraft = (email: string, fullName: string): AddressDraft => ({
  label: "Home",
  fullName,
  email,
  phone: "",
  address: "",
  district: "",
  province: "",
  postalCode: "",
  isDefault: false,
});

const inputClass =
  "min-h-12 w-full rounded-xl border border-forest-100 bg-surface px-4 text-sm text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export default function AddressManager({
  initialAddresses,
  setupRequired,
  profileEmail,
  profileName,
}: {
  initialAddresses: SavedAddress[];
  setupRequired: boolean;
  profileEmail: string;
  profileName: string;
}) {
  const t = useTranslations("auth.account");
  const checkout = useTranslations("checkout");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [draft, setDraft] = useState<AddressDraft>(() => emptyDraft(profileEmail, profileName));
  const [errors, setErrors] = useState<Partial<Record<ShippingField, string>>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setDraft({
      ...emptyDraft(profileEmail, profileName),
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setApiError(null);
  };

  const openEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setDraft({ ...address });
    setErrors({});
    setApiError(null);
  };

  const closeForm = () => {
    setEditingId(undefined);
    setErrors({});
    setApiError(null);
  };

  const setField = <K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key in EMPTY_SHIPPING) {
      setErrors((current) => ({ ...current, [key as ShippingField]: undefined }));
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateShipping({ ...draft, note: "" });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !draft.label.trim()) return;

    setBusy(true);
    setApiError(null);
    setMessage(null);
    try {
      const isEdit = typeof editingId === "string";
      const response = await fetch(
        isEdit ? `/api/account/addresses/${editingId}` : "/api/account/addresses",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        }
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? t("addressSaveError"));
      const saved = body.address as SavedAddress;
      setAddresses((current) => {
        const normalized = saved.isDefault
          ? current.map((item) => ({ ...item, isDefault: false }))
          : current;
        return isEdit
          ? normalized.map((item) => (item.id === saved.id ? saved : item))
          : [...normalized, saved];
      });
      setMessage(t("addressSaved"));
      closeForm();
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : t("addressSaveError"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (address: SavedAddress) => {
    if (!window.confirm(t("deleteAddressConfirm", { label: address.label }))) return;
    setBusy(true);
    setApiError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/account/addresses/${address.id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? t("addressDeleteError"));
      setAddresses((current) => {
        const remaining = current.filter((item) => item.id !== address.id);
        if (address.isDefault && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
      setMessage(t("addressDeleted"));
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : t("addressDeleteError"));
    } finally {
      setBusy(false);
    }
  };

  const field = (
    key: Exclude<ShippingField, "note">,
    label: string,
    options?: { type?: string; autoComplete?: string; className?: string }
  ) => (
    <label className={options?.className}>
      <span className="mb-1.5 block text-xs font-semibold text-content">{label}</span>
      <input
        type={options?.type ?? "text"}
        autoComplete={options?.autoComplete}
        value={draft[key]}
        onChange={(event) => setField(key, event.target.value)}
        aria-invalid={!!errors[key]}
        className={inputClass}
      />
      {errors[key] && (
        <span className="mt-1 block text-xs text-red-600">{checkout(`errors.${errors[key]}`)}</span>
      )}
    </label>
  );

  return (
    <section aria-labelledby="addresses-heading" className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
            {t("delivery")}
          </p>
          <h2 id="addresses-heading" className="mt-1 font-display text-xl font-extrabold text-content">
            {t("addressesHeading")}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t("addressesSub")}</p>
        </div>
        {!setupRequired && editingId === undefined && (
          <button
            type="button"
            onClick={openNew}
            className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-gold px-4 text-xs font-bold text-forest-950"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("addAddress")}
          </button>
        )}
      </div>

      <div aria-live="polite" className="mt-4">
        {message && (
          <p className="flex items-center gap-2 rounded-lg bg-forest-100/50 px-3 py-2 text-xs font-semibold text-forest">
            <Check className="h-4 w-4" aria-hidden="true" /> {message}
          </p>
        )}
        {apiError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {apiError}
          </p>
        )}
      </div>

      {setupRequired ? (
        <div className="mt-5 rounded-xl border border-dashed border-gold/60 bg-gold/10 p-4 text-sm leading-relaxed text-content">
          {t("addressesSetup")}
        </div>
      ) : editingId !== undefined ? (
        <form onSubmit={save} className="mt-5 rounded-xl border border-forest-100 bg-cloud/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-content">
              {editingId ? t("editAddress") : t("newAddress")}
            </h3>
            <button type="button" onClick={closeForm} aria-label={t("cancel")} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:bg-surface">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-content">{t("addressLabel")}</span>
              <input
                value={draft.label}
                onChange={(event) => setField("label", event.target.value)}
                placeholder={t("addressLabelPlaceholder")}
                maxLength={60}
                className={inputClass}
              />
            </label>
            {field("fullName", checkout("fullName"), { autoComplete: "name", className: "sm:col-span-2" })}
            {field("email", checkout("email"), { type: "email", autoComplete: "email" })}
            {field("phone", checkout("phone"), { type: "tel", autoComplete: "tel" })}
            {field("address", checkout("address"), { autoComplete: "street-address", className: "sm:col-span-2" })}
            {field("district", checkout("district"), { autoComplete: "address-level2" })}
            {field("province", checkout("province"), { autoComplete: "address-level1" })}
            {field("postalCode", checkout("postalCode"), { autoComplete: "postal-code" })}
            <label className="flex min-h-12 items-center gap-3 pt-5 text-sm font-medium text-content">
              <input
                type="checkbox"
                checked={draft.isDefault}
                onChange={(event) => setField("isDefault", event.target.checked)}
                className="h-4 w-4 accent-[#f5c842]"
              />
              {t("makeDefault")}
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={closeForm} className="min-h-11 cursor-pointer rounded-full border border-forest-100 px-5 text-xs font-semibold text-content">
              {t("cancel")}
            </button>
            <button type="submit" disabled={busy} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold px-6 text-xs font-bold text-forest-950 disabled:opacity-50">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {t("saveAddress")}
            </button>
          </div>
        </form>
      ) : addresses.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-forest-100 px-6 py-10 text-center">
          <MapPin className="h-8 w-8 text-gold-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-content">{t("noAddresses")}</p>
          <p className="mt-1 text-xs text-ink-muted">{t("noAddressesSub")}</p>
          <button type="button" onClick={openNew} className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-gold px-5 text-xs font-bold text-forest-950">
            <Plus className="h-4 w-4" aria-hidden="true" /> {t("addAddress")}
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {addresses.map((item) => (
            <article key={item.id} className="rounded-xl border border-forest-100 bg-cloud/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-content">{item.label}</h3>
                </div>
                {item.isDefault && (
                  <span className="rounded-full bg-gold/20 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-gold-600">
                    {t("defaultAddress")}
                  </span>
                )}
              </div>
              <address className="mt-3 text-xs not-italic leading-relaxed text-ink-muted">
                <strong className="font-semibold text-content">{item.fullName}</strong><br />
                {item.address}<br />
                {item.district}, {item.province} {item.postalCode}<br />
                {item.phone}
              </address>
              <div className="mt-4 flex gap-2 border-t border-forest-100 pt-3">
                <button type="button" onClick={() => openEdit(item)} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-content hover:bg-surface">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t("edit")}
                </button>
                <button type="button" onClick={() => remove(item)} disabled={busy} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t("delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
