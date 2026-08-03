"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, LoaderCircle, Pencil, Star, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Review, ReviewSummary, ReviewSort } from "@/lib/reviewStore";

/* ---------- star display (supports fractional fill for the average) ---------- */
function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (fill: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${className} ${fill ? "fill-gold text-gold" : "fill-forest-100 text-forest-100"}`} aria-hidden="true" />
    ));
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} out of 5`}>
      <span className="flex gap-0.5">{row(false)}</span>
      <span className="absolute inset-0 flex gap-0.5 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

/* ---------- interactive rating input ---------- */
function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          className="cursor-pointer p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`h-7 w-7 ${n <= shown ? "fill-gold text-gold" : "fill-forest-100 text-forest-200"}`} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const t = useTranslations("reviews");
  const locale = useLocale();

  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [yourReview, setYourReview] = useState<Review | null>(null);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);

  const load = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}&sort=${sort}&offset=${offset}`
        );
        const data = await res.json();
        setSummary(data.summary);
        setTotal(data.total ?? 0);
        setLoggedIn(!!data.viewer?.loggedIn);
        setYourReview(data.yourReview ?? null);
        setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
      } catch {
        /* leave whatever is on screen; the empty state covers a total failure */
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productId, sort]
  );

  useEffect(() => {
    // Data-fetch on mount and when the sort changes (load() owns its loading flag).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(0, false);
  }, [load]);

  const openForm = () => {
    setFormError(null);
    setThanks(false);
    setRating(yourReview?.rating ?? 0);
    setTitle(yourReview?.title ?? "");
    setText(yourReview?.body ?? "");
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return setFormError(t("errRating"));
    if (title.trim().length < 3) return setFormError(t("errTitle"));
    if (text.trim().length < 10) return setFormError(t("errReview"));
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title: title.trim(), body: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          unauthenticated: t("errAuth"),
          invalid_rating: t("errRating"),
          invalid_title: t("errTitle"),
          invalid_review: t("errReview"),
        };
        setFormError(map[data.error] ?? t("errGeneric"));
        return;
      }
      setSummary(data.summary);
      setYourReview(data.review);
      setFormOpen(false);
      setThanks(true);
      await load(0, false); // refresh the list in the correct order
    } catch {
      setFormError(t("errGeneric"));
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const count = summary?.count ?? 0;
  const average = summary?.average ?? 0;

  const writeButton = (() => {
    if (!loggedIn) {
      return (
        <Link
          href="/login"
          className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-forest px-6 text-[14px] font-bold text-content transition-colors hover:border-gold hover:text-gold-600"
        >
          {t("loginToReview")}
        </Link>
      );
    }
    return (
      <button
        type="button"
        onClick={openForm}
        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-gold px-6 text-[14px] font-bold text-forest-950 transition-transform duration-300 hover:scale-[1.03]"
      >
        {yourReview ? <Pencil className="h-4 w-4" aria-hidden="true" /> : null}
        {yourReview ? t("editReview") : t("writeReview")}
      </button>
    );
  })();

  return (
    <section id="reviews" className="mx-auto max-w-5xl">
      <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-content sm:text-4xl">
        {t("heading")}
      </h2>

      {loading ? (
        <div className="mt-10 flex justify-center py-12">
          <LoaderCircle className="h-6 w-6 animate-spin text-gold-600" aria-hidden="true" />
        </div>
      ) : (
        <>
          {/* summary */}
          {count > 0 ? (
            <div className="mt-10 grid items-center gap-8 rounded-3xl border border-forest-100 bg-cloud/50 p-6 sm:p-8 md:grid-cols-[auto_1fr_auto] md:gap-12">
              <div className="text-center md:text-left">
                <Stars value={average} className="h-5 w-5" />
                <p className="mt-2 font-display text-2xl font-extrabold text-content">
                  {t("outOf", { rating: average.toFixed(2) })}
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">{t("basedOn", { count })}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const c = summary?.distribution[star] ?? 0;
                  const pct = count ? (c / count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-[13px]">
                      <span className="flex w-8 shrink-0 items-center gap-1 tabular-nums text-ink-muted">
                        {star}
                        <Star className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
                      </span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-forest-100">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 shrink-0 text-right tabular-nums text-ink-muted">{c}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center md:justify-end">{writeButton}</div>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-forest-100 bg-cloud/40 px-8 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Star className="h-6 w-6 fill-gold text-gold" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-content">{t("emptyTitle")}</p>
                <p className="mt-1 text-[13.5px] text-ink-muted">{t("emptyBody")}</p>
              </div>
              {writeButton}
            </div>
          )}

          {thanks && (
            <p className="mt-4 flex items-center justify-center gap-2 text-[13.5px] font-semibold text-gold-600">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {t("thanks")}
            </p>
          )}

          {/* write form */}
          <AnimatePresence initial={false}>
            {formOpen && (
              <motion.form
                onSubmit={submit}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 rounded-2xl border border-forest-100 bg-surface p-6 sm:p-7">
                  <h3 className="font-display text-lg font-bold text-content">{t("formTitle")}</h3>
                  <div className="mt-5 flex flex-col gap-5">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-content">{t("ratingLabel")}</label>
                      <StarInput value={rating} onChange={setRating} label={t("ratingLabel")} />
                    </div>
                    <div>
                      <label htmlFor="rv-title" className="mb-1.5 block text-[13px] font-semibold text-content">
                        {t("titleLabel")}
                      </label>
                      <input
                        id="rv-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        placeholder={t("titlePlaceholder")}
                        className="min-h-[46px] w-full rounded-xl border border-forest-100 bg-cloud/40 px-4 text-[14px] text-content placeholder:text-ink-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                      />
                    </div>
                    <div>
                      <label htmlFor="rv-body" className="mb-1.5 block text-[13px] font-semibold text-content">
                        {t("bodyLabel")}
                      </label>
                      <textarea
                        id="rv-body"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={2000}
                        rows={4}
                        placeholder={t("bodyPlaceholder")}
                        className="w-full rounded-xl border border-forest-100 bg-cloud/40 px-4 py-3 text-[14px] leading-relaxed text-content placeholder:text-ink-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
                      />
                    </div>
                    {formError && (
                      <p role="alert" className="text-[13px] font-medium text-red-600">
                        {formError}
                      </p>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-forest-950 transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {submitting ? t("submitting") : t("submit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormOpen(false)}
                        className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-forest-100 px-6 text-[14px] font-semibold text-content transition-colors hover:border-gold sm:flex-none"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* list */}
          {count > 0 && (
            <>
              <div className="mt-8 flex items-center justify-between border-b border-forest-100 pb-3">
                <span className="text-[13px] font-semibold text-content">{t("sortLabel")}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ReviewSort)}
                  aria-label={t("sortLabel")}
                  className="cursor-pointer rounded-lg border border-forest-100 bg-surface px-3 py-1.5 text-[13px] font-medium text-content focus:border-gold focus:outline-none"
                >
                  <option value="recent">{t("sortRecent")}</option>
                  <option value="highest">{t("sortHighest")}</option>
                  <option value="lowest">{t("sortLowest")}</option>
                </select>
              </div>

              <ul className="divide-y divide-forest-100">
                {reviews.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex items-center justify-between gap-4">
                      <Stars value={r.rating} />
                      <time className="text-[12.5px] text-ink-muted">{fmtDate(r.createdAt)}</time>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cloud text-ink-muted">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[13.5px] font-semibold text-gold-600">{r.authorName}</span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-gold-600">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("verified")}
                        </span>
                      )}
                      {r.mine && (
                        <span className="rounded-md bg-forest-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-muted">
                          {t("yours")}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-[15px] font-bold text-content">{r.title}</h3>
                    <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-ink-muted">{r.body}</p>
                  </li>
                ))}
              </ul>

              {reviews.length < total && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => load(reviews.length, true)}
                    disabled={loadingMore}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-forest-100 px-6 text-[13.5px] font-semibold text-content transition-colors hover:border-gold disabled:opacity-60"
                  >
                    {loadingMore && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {t("loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
