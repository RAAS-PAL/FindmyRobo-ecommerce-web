"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Save } from "lucide-react";
import { categories } from "@/data/categories";
import {
  ROBOT_VARIANTS,
  SPEC_KEYS,
  type SpecKey,
} from "@/data/products";
import RobotIllustration from "@/components/ui/RobotIllustration";

const SPEC_LABELS: Record<SpecKey, string> = {
  area: "Coverage area (e.g. 3,000 m²)",
  slope: "Max slope (e.g. 80% (38°))",
  cuttingWidth: "Cutting width (e.g. 400 mm)",
  runtime: "Runtime (e.g. 180 min)",
  connectivity: "Navigation & connectivity",
  filtration: "Filtration (pool robots)",
};

const VARIANT_LABELS = {
  luba: "Large mower",
  mini: "Compact mower",
  pool: "Pool robot",
} as const;

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-navy-100 bg-white px-4 text-[14px] text-navy placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const textareaClass =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-[14px] leading-relaxed text-navy placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-navy";
const hintClass = "mt-1 text-[11.5px] text-ink-muted";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function NewProductForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [variant, setVariant] = useState<(typeof ROBOT_VARIANTS)[number]>("luba");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => null);
      setError(body?.error ?? `Save failed (${res.status})`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <Section title="Basics">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MAMMOTION LUBA 3 AWD 3000"
            className={inputClass}
          />
          {name && (
            <p className={hintClass}>
              URL: /products/<span className="font-mono">{slugify(name)}</span>
            </p>
          )}
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (฿, THB)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step={1}
            placeholder="159000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select id="category" name="category" className={inputClass}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {!c.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="variant" className={labelClass}>
            Illustration style
          </label>
          <div className="flex items-center gap-4">
            <select
              id="variant"
              name="variant"
              value={variant}
              onChange={(e) => setVariant(e.target.value as typeof variant)}
              className={inputClass}
            >
              {ROBOT_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {VARIANT_LABELS[v]}
                </option>
              ))}
            </select>
            <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy via-navy-800 to-navy-950 p-1.5">
              <RobotIllustration variant={variant} className="h-full w-auto" />
            </span>
          </div>
          <p className={hintClass}>Placeholder art until real product photos land.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            id="preorder"
            name="preorder"
            type="checkbox"
            value="1"
            className="h-4.5 w-4.5 rounded border-navy-100 accent-[#f5c842]"
          />
          <label htmlFor="preorder" className="text-[13.5px] font-medium text-navy">
            Preorder (not in stock yet)
          </label>
        </div>
      </Section>

      <Section title="Marketing copy — English">
        <div>
          <label htmlFor="taglineEn" className={labelClass}>
            Tagline
          </label>
          <input
            id="taglineEn"
            name="taglineEn"
            required
            placeholder="All-wheel drive precision for large Thai gardens"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="descriptionEn" className={labelClass}>
            Description
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            required
            rows={3}
            className={textareaClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="featuresEn" className={labelClass}>
            Feature bullets — one per line
          </label>
          <textarea
            id="featuresEn"
            name="featuresEn"
            required
            rows={4}
            placeholder={"AWD climbs slopes up to 80%\nNo boundary wire needed"}
            className={textareaClass}
          />
        </div>
      </Section>

      <Section title="Marketing copy — Thai">
        <div>
          <label htmlFor="taglineTh" className={labelClass}>
            Tagline (ภาษาไทย)
          </label>
          <input id="taglineTh" name="taglineTh" required className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="descriptionTh" className={labelClass}>
            Description (ภาษาไทย)
          </label>
          <textarea
            id="descriptionTh"
            name="descriptionTh"
            required
            rows={3}
            className={textareaClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="featuresTh" className={labelClass}>
            Feature bullets (ภาษาไทย) — one per line
          </label>
          <textarea
            id="featuresTh"
            name="featuresTh"
            required
            rows={4}
            className={textareaClass}
          />
        </div>
      </Section>

      <Section title="Technical specs (optional)">
        {SPEC_KEYS.map((key) => (
          <div key={key}>
            <label htmlFor={`spec_${key}`} className={labelClass}>
              {SPEC_LABELS[key]}
            </label>
            <input id={`spec_${key}`} name={`spec_${key}`} className={inputClass} />
          </div>
        ))}
      </Section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="flex min-h-[48px] cursor-pointer items-center rounded-full border border-navy-100 px-6 text-[13.5px] font-semibold text-navy transition-colors hover:border-gold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full bg-gold px-8 text-[14px] font-bold text-navy-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          Save product
        </button>
      </div>
    </form>
  );
}
