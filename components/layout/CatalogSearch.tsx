"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Search } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useProducts } from "@/components/ProductsProvider";
import ProductVisual from "@/components/ui/ProductVisual";
import { searchProducts } from "@/lib/productSearch";
import type { Locale } from "@/data/products";

export default function CatalogSearch({
  className = "",
  inputClassName = "",
  dropdownClassName = "",
  onNavigate,
}: {
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { products } = useProducts();
  const rootRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const suggestionsId = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const term = query.trim();
  const suggestions = useMemo(
    () =>
      term
        ? searchProducts(products, term, locale, (slug) => tc(`${slug}.name`)).slice(0, 5)
        : [],
    [locale, products, tc, term]
  );
  const showSuggestions = focused && term.length > 0;

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const goToResults = () => {
    if (!term || composingRef.current) return;
    setFocused(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    goToResults();
  };

  const navigated = () => {
    setFocused(false);
    setQuery("");
    onNavigate?.();
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      return;
    }
    if (!showSuggestions || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0 && !composingRef.current) {
      event.preventDefault();
      const product = suggestions[activeIndex];
      setFocused(false);
      onNavigate?.();
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form role="search" onSubmit={submit}>
        <label className="relative block">
          <span className="sr-only">{t("searchPlaceholder")}</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted/60"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={onSearchKeyDown}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            maxLength={100}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={suggestionsId}
            aria-activedescendant={activeIndex >= 0 ? `${suggestionsId}-${activeIndex}` : undefined}
            className={inputClassName}
          />
        </label>
      </form>

      {showSuggestions && (
        <div
          id={suggestionsId}
          role="listbox"
          className={`absolute top-full z-[70] mt-2 overflow-hidden rounded-xl border border-forest-100 bg-surface shadow-[0_20px_50px_-18px_rgba(10,46,31,0.35)] ${dropdownClassName}`}
        >
          {suggestions.length > 0 ? (
            <div className="p-2">
              {suggestions.map((product, index) => (
                <Link
                  key={product.id}
                  id={`${suggestionsId}-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  href={`/products/${product.id}`}
                  onClick={navigated}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-cloud ${
                    activeIndex === index ? "bg-cloud" : ""
                  }`}
                >
                  <span className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cloud p-1">
                    <ProductVisual product={product} className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-content">{product.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
                      {tc(`${product.category}.name`)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-center text-sm text-ink-muted">
              {t("searchNoResults", { query: term })}
            </p>
          )}
          <button
            type="button"
            onClick={goToResults}
            className="flex min-h-12 w-full cursor-pointer items-center justify-between border-t border-forest-100 bg-cloud/60 px-4 text-xs font-bold text-content transition-colors hover:text-gold-600"
          >
            {t("searchViewAll", { query: term })}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
