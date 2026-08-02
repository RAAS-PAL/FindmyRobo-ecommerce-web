"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Calendar,
  ChevronDown,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { categories, categoryHref } from "@/data/categories";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useCart } from "@/components/cart/CartProvider";
import { useProducts } from "@/components/ProductsProvider";
import ProductVisual from "@/components/ui/ProductVisual";
import CatalogSearch from "@/components/layout/CatalogSearch";
import { createClient } from "@/lib/supabase/client";
import type { CategorySlug } from "@/data/categories";
import type { Locale } from "@/data/products";

interface NavChild {
  label: string;
  href: string;
  description?: string;
  comingSoon?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

function SoonBadge({ label }: { label: string }) {
  return (
    <span className="ml-2 shrink-0 rounded-full bg-gold/25 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-gold-600">
      {label}
    </span>
  );
}

function DropdownChild({
  item,
  soonLabel,
  onNavigate,
}: {
  item: NavChild;
  soonLabel: string;
  onNavigate?: () => void;
}) {
  if (item.comingSoon) {
    return (
      <span
        aria-disabled="true"
        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] text-ink-muted/60"
      >
        <span>
          {item.label}
          {item.description && (
            <span className="mt-0.5 block text-[11px] text-ink-muted/50">{item.description}</span>
          )}
        </span>
        <SoonBadge label={soonLabel} />
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="block rounded-lg px-3 py-2.5 text-[13px] text-content/85 transition-colors hover:bg-cloud hover:text-gold-600"
    >
      {item.label}
      {item.description && (
        <span className="mt-0.5 block text-[11px] text-ink-muted/70">{item.description}</span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  const locale = useLocale() as Locale;
  const { products } = useProducts();
  const { count, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<number | null>(null);
  const [previewCategory, setPreviewCategory] = useState<CategorySlug>(
    categories[0].slug
  );

  // Hover menus close on a short delay, so moving the cursor from the trigger
  // down to the panel (across the small gap) doesn't dismiss them mid-travel.
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMenu = (index: number) => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setDesktopMenu(index);
  };
  const scheduleCloseMenu = () => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = setTimeout(() => setDesktopMenu(null), 220);
  };
  useEffect(
    () => () => {
      if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setLoggedIn(!!session?.user)
    );
    return () => subscription.unsubscribe();
  }, []);
  // index into navLinks; Shop (0) starts expanded in the drawer
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* "Shop" is generated from the category data — new categories appear here automatically */
  const navLinks: NavItem[] = [
    {
      label: t("shop"),
      href: "/shop",
      children: categories.map((c) => ({
        label: tc(`${c.slug}.name`),
        href: categoryHref(c.slug),
        description: tc(`${c.slug}.description`),
        comingSoon: !c.available,
      })),
    },
    { label: t("tv"), href: "/#youtube" },
    {
      label: t("about"),
      href: "/#about",
      children: [
        { label: t("aboutStory"), href: "/#about" },
        { label: t("aboutWhyUs"), href: "/#support" },
        { label: t("aboutPartners"), href: "/#about" },
      ],
    },
    {
      label: t("contact"),
      href: "/#contact",
      children: [
        { label: t("contactSales"), href: "/contact-sales" },
        { label: t("contactTouch"), href: "/#contact" },
        { label: t("contactDemo"), href: "/products/request-a-demo" },
        { label: t("contactLocations"), href: "/#contact" },
      ],
    },
    { label: t("support"), href: "/#support" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-forest-100 bg-surface/85 shadow-[0_8px_28px_-16px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          : "border-forest-100/70 bg-surface"
      }`}
    >
      <nav className="relative flex h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* soft grey wedge over the left half (light mode only): a subtle panel
            that ends in an angled edge near the middle; the rest stays white.
            -z-10 keeps it behind the bar content; dark mode hides it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[46%] bg-[#eef0f2] dark:hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 44px) 100%, 0 100%)" }}
        />

        {/* left group: logo + primary links, kept together on the left edge */}
        <div className="flex items-center gap-6 xl:gap-9">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RoboStore TH home">
          <Image
            src="/logo-r-gold.png"
            alt="RoboStore TH"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-content">
            RoboStore<span className="text-gold-600"> TH</span>
          </span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-6 xl:flex">
          {navLinks.map((link, linkIndex) => (
            <li
              key={link.label}
              className={linkIndex === 0 ? "static" : "relative"}
              onMouseEnter={() => link.children && openMenu(linkIndex)}
              onMouseLeave={() => link.children && scheduleCloseMenu()}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setDesktopMenu(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setDesktopMenu(null);
                  (event.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
                }
              }}
            >
              {link.children ? (
                <button
                  type="button"
                  onClick={() => {
                    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
                    setDesktopMenu((current) => (current === linkIndex ? null : linkIndex));
                  }}
                  aria-expanded={desktopMenu === linkIndex}
                  aria-haspopup="menu"
                  className="nav-underline flex cursor-pointer items-center gap-1 whitespace-nowrap py-2 text-[13.5px] font-bold text-content/80 transition-colors hover:text-content"
                >
                  {link.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-gold-600 transition-transform duration-200 ${
                      desktopMenu === linkIndex ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className="nav-underline flex items-center gap-1 whitespace-nowrap py-2 text-[13.5px] font-bold text-content/80 transition-colors hover:text-content"
                >
                  {link.label}
                </Link>
              )}
              {link.children && (
                <div
                  className={`absolute top-full z-50 transition-all duration-200 ${
                    linkIndex === 0
                      ? // Shop mega-menu is positioned off the <nav>, so top-full
                        // already sits at the navbar's bottom edge — no pt, so the
                        // panel is flush against the bar with no gap.
                        "left-4 right-4 mx-auto w-[920px] max-w-[calc(100%-2rem)]"
                      : // Simple dropdowns hang off their own button; pt-3 clears
                        // the rest of the navbar height below the trigger.
                        "left-1/2 -translate-x-1/2 pt-3"
                  } ${
                    desktopMenu === linkIndex
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0"
                  }`}
                >
                  {linkIndex === 0 ? (
                    <div className="grid w-full grid-cols-[240px_1fr] overflow-hidden rounded-2xl border border-forest-100 bg-surface/95 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                      <div className="border-r border-forest-100 p-2.5">
                        {categories.map((category) => {
                          const active = previewCategory === category.slug;
                          const inner = (
                            <>
                              <span className="flex items-center text-[13px] font-semibold">
                                {tc(`${category.slug}.name`)}
                                {!category.available && <SoonBadge label={t("soon")} />}
                              </span>
                              <span className="mt-1 block text-[10.5px] leading-snug text-ink-muted/70">
                                {tc(`${category.slug}.description`)}
                              </span>
                            </>
                          );
                          // Coming-soon categories still drive the preview on
                          // hover/focus, but aren't links — nothing to shop yet.
                          return category.available ? (
                            <Link
                              key={category.slug}
                              href={categoryHref(category.slug)}
                              onClick={() => setDesktopMenu(null)}
                              onMouseEnter={() => setPreviewCategory(category.slug)}
                              onFocus={() => setPreviewCategory(category.slug)}
                              className={`block rounded-xl px-3.5 py-3 transition-colors ${
                                active
                                  ? "bg-cloud text-gold-600"
                                  : "text-content/85 hover:bg-cloud hover:text-gold-600"
                              }`}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <button
                              key={category.slug}
                              type="button"
                              aria-disabled="true"
                              onMouseEnter={() => setPreviewCategory(category.slug)}
                              onFocus={() => setPreviewCategory(category.slug)}
                              className={`block w-full cursor-default rounded-xl px-3.5 py-3 text-left text-ink-muted/70 transition-colors ${
                                active ? "bg-cloud" : "hover:bg-cloud"
                              }`}
                            >
                              {inner}
                            </button>
                          );
                        })}
                      </div>

                      <div className="min-h-[330px] p-5">
                        <div className="mb-4 flex items-end justify-between gap-4">
                          <div>
                            <p className="font-display text-lg font-bold text-content">
                              {tc(`${previewCategory}.name`)}
                            </p>
                            <p className="mt-1 text-xs text-ink-muted">
                              {tc(`${previewCategory}.description`)}
                            </p>
                          </div>
                          {categories.find((c) => c.slug === previewCategory)?.available ? (
                            <Link
                              href={categoryHref(previewCategory)}
                              onClick={() => setDesktopMenu(null)}
                              className="shrink-0 text-xs font-semibold text-gold-600 hover:text-content"
                            >
                              {t("shop")} →
                            </Link>
                          ) : (
                            <SoonBadge label={t("soon")} />
                          )}
                        </div>

                        {products.some((product) => product.category === previewCategory) ? (
                          <div className="grid grid-cols-3 gap-3">
                            {products
                              .filter((product) => product.category === previewCategory)
                              .slice(0, 3)
                              .map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.id}`}
                                  onClick={() => setDesktopMenu(null)}
                                  className="group/card overflow-hidden rounded-xl border border-forest-100 bg-cloud/65 p-3 transition hover:-translate-y-0.5 hover:border-gold-600/40 hover:shadow-md"
                                >
                                  <div className="flex h-28 items-center justify-center">
                                    <ProductVisual product={product} preferHome className="h-full w-full" />
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs font-bold leading-snug text-content">
                                    {product.name}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-ink-muted">
                                    {product.tagline[locale]}
                                  </p>
                                </Link>
                              ))}
                          </div>
                        ) : (
                          <div className="flex h-[230px] flex-col items-center justify-center rounded-xl border border-dashed border-forest-100 bg-cloud/50 px-8 text-center">
                            <Bot className="h-16 w-16 text-gold-600/70" aria-hidden="true" />
                            <p className="mt-4 max-w-xs text-sm font-semibold text-content">
                              {tc(`${previewCategory}.name`)}
                            </p>
                            <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-muted">
                              {tc(`${previewCategory}.description`)}
                            </p>
                            {!categories.find((c) => c.slug === previewCategory)?.available && (
                              <span className="mt-3">
                                <SoonBadge label={t("soon")} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-64 overflow-hidden rounded-xl border border-forest-100 bg-surface/95 p-2 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                      {link.children.map((item) => (
                        <DropdownChild
                          key={item.label}
                          item={item}
                          soonLabel={t("soon")}
                          onNavigate={() => setDesktopMenu(null)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        </div>

        {/* right cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Collapsed to a magnifier button; the field slides open on hover
              (group-hover) or when focused/clicked (focus). */}
          <CatalogSearch
            className="group hidden lg:block"
            inputClassName="h-11 w-11 cursor-pointer rounded-full border border-forest-100 bg-cloud pl-10 pr-0 text-[13px] text-content placeholder:text-ink-muted/70 transition-all duration-300 group-hover:w-60 group-hover:cursor-text group-hover:pr-4 focus:w-60 focus:cursor-text focus:pr-4 focus:border-gold-600/60 focus:bg-surface focus:outline-none"
            dropdownClassName="right-0 w-[360px]"
          />

          <Link
            href="/products/request-a-demo"
            className="hidden min-h-[44px] items-center gap-2 rounded-full bg-gold px-5 text-[13.5px] font-bold text-forest-950 shadow-[0_0_0_0_rgba(245,200,66,0)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] active:scale-[0.97] sm:flex"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {t("bookDemo")}
          </Link>

          <ThemeToggle className="hidden md:flex" />
          <LanguageSwitcher className="hidden md:flex" />

          <Link
            href={loggedIn ? "/account" : "/login"}
            aria-label={loggedIn ? t("account") : t("signIn")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-content transition-colors hover:bg-cloud hover:text-gold-600"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            aria-label={t("cartLabel", { count })}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-content transition-colors hover:bg-cloud hover:text-gold-600"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-0.5 font-mono text-[10px] font-bold text-forest-950">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-content transition-colors hover:bg-cloud xl:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-forest-950/50 backdrop-blur-sm xl:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-surface shadow-2xl xl:hidden"
              role="dialog"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between border-b border-forest-100 px-5 py-4">
                <span className="flex items-center gap-2.5">
                  <Image
                    src="/logo-r-gold.png"
                    alt="RoboStore TH"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="font-display text-base font-extrabold text-content">
                    RoboStore<span className="text-gold-600"> TH</span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("closeMenu")}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-content hover:bg-cloud"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <CatalogSearch
                  className="mb-6 block"
                  inputClassName="h-12 w-full rounded-full border border-forest-100 bg-cloud pl-10 pr-4 text-sm text-content placeholder:text-ink-muted/70 focus:border-gold-600/60 focus:bg-surface focus:outline-none"
                  dropdownClassName="inset-x-0 w-full"
                  onNavigate={() => setOpen(false)}
                />
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                    >
                      {link.children ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpanded(expanded === i ? null : i)}
                            aria-expanded={expanded === i}
                            className="flex min-h-[48px] w-full cursor-pointer items-center justify-between rounded-xl px-4 text-[15px] font-bold text-content transition-colors hover:bg-cloud hover:text-gold-600"
                          >
                            {link.label}
                            <ChevronDown
                              className={`h-4 w-4 text-gold-600 transition-transform duration-200 ${
                                expanded === i ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {expanded === i && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden pl-4"
                              >
                                {link.children.map((item) => (
                                  <li key={item.label}>
                                    {item.comingSoon ? (
                                      <span className="flex min-h-[44px] items-center px-4 text-[14px] text-ink-muted/60">
                                        {item.label}
                                        <SoonBadge label={t("soon")} />
                                      </span>
                                    ) : (
                                      <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex min-h-[44px] items-center rounded-lg px-4 text-[14px] text-ink-muted transition-colors hover:bg-cloud hover:text-gold-600"
                                      >
                                        {item.label}
                                      </Link>
                                    )}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-bold text-content transition-colors hover:bg-cloud hover:text-gold-600"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-3 border-t border-forest-100 pt-6">
                  <LanguageSwitcher className="w-fit" />
                  <ThemeToggle />
                </div>
              </div>

              <div className="border-t border-forest-100 p-5">
                <Link
                  href="/products/request-a-demo"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950"
                >
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {t("bookDemo")}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
