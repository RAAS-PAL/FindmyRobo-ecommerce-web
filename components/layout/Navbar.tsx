"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  CalendarDays,
  ChevronDown,
  Handshake,
  Headset,
  LifeBuoy,
  MapPin,
  Menu,
  MessageCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { categoryHref, navCategories, type CategorySlug } from "@/data/categories";
import { lineupFor, lineupModelName, type LineupModel } from "@/data/lineup";
import { siteConfig } from "@/data/siteConfig";
import type { Product } from "@/data/products";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { useCart } from "@/components/cart/CartProvider";
import CartIcon from "@/components/cart/CartIcon";
import { useQuote } from "@/components/quote/QuoteProvider";
import { useProducts } from "@/components/ProductsProvider";
import ProductVisual from "@/components/ui/ProductVisual";
import ModelTile from "@/components/ui/ModelTile";
import ConditionLine from "@/components/ui/ConditionLine";
import CatalogSearch from "@/components/layout/CatalogSearch";

interface NavChild {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface NavGroup {
  heading: string;
  items: NavChild[];
}

/** One model in a category's menu: a catalogue product, or a lineup model
 *  (data/lineup.ts) that has no product page yet. */
interface MenuModel {
  key: string;
  name: string;
  brand?: string;
  href: string;
  product?: Product;
  lineup?: LineupModel;
}

interface NavItem {
  label: string;
  /** A product category: its tab opens a full-width panel of its models. */
  category?: CategorySlug;
  models?: MenuModel[];
  /** Otherwise a dropdown of link groups (the About menu). */
  groups?: NavGroup[];
  /** The page being viewed belongs to this section — the accent track rests under it. */
  current?: boolean;
}

function DropdownChild({ item, onNavigate }: { item: NavChild; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group/item flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-semibold text-content/85 transition-colors hover:bg-cloud hover:text-content"
    >
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cloud text-content/60 transition-colors duration-200 group-hover/item:bg-accent/30 group-hover/item:text-accent-600">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      {item.label}
    </Link>
  );
}

/** Small uppercase label over a group of links. */
const groupHeadingClass =
  "font-mono text-[10.5px] font-semibold tracking-[0.2em] text-ink-muted uppercase [&:lang(th)]:tracking-[0.04em]";

export default function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { products } = useProducts();
  const { count, openDrawer } = useCart();
  const { openQuote } = useQuote();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<number | null>(null);

  // Hover menus close on a short delay, so the pointer can cross from a tab to
  // its panel (or brush past the edge) without dismissing it mid-travel.
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMenu = (index: number) => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    setDesktopMenu(index);
  };
  const scheduleCloseMenu = () => {
    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = setTimeout(() => setDesktopMenu(null), 220);
  };
  const closeMenu = () => setDesktopMenu(null);
  useEffect(
    () => () => {
      if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
    },
    []
  );

  // index into navLinks open in the phone drawer; all start closed
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pathname = usePathname();
  // DJI-style: on the homepage, before any scroll, the bar sits clear over
  // the dark hero (white text, no background — styles in globals.css under
  // header[data-clear]). Scrolling makes it solid, and so does hovering or
  // focusing anything in it, so its menus always open on a solid bar.
  const clear = pathname === "/" && !scrolled;

  // Which section the page belongs to: a category page, or a product's page
  // (by that product's category). The About menu also holds the contact
  // pages — the demo booking lives under /products but is listed there.
  const viewedProduct = pathname.startsWith("/products/")
    ? products.find((product) => pathname === `/products/${product.id}`)
    : undefined;
  const currentCategory = pathname.startsWith("/shop/")
    ? pathname.split("/")[2]
    : viewedProduct?.category;
  const inAbout =
    pathname === "/about" ||
    pathname === "/contact-sales" ||
    pathname === "/location" ||
    pathname === "/recommend" ||
    pathname.startsWith("/products/request-a-demo");

  // A category's models: its catalogue products, or — until it has any — the
  // lineup models, which link to their card on the category page.
  const modelsFor = (slug: CategorySlug): MenuModel[] => {
    const own = products.filter((product) => product.category === slug);
    if (own.length > 0) {
      return own.map((product) => ({
        key: product.id,
        name: product.name,
        href: `/products/${product.id}`,
        product,
      }));
    }
    return lineupFor(slug).map((model) => ({
      key: model.id,
      name: model.name,
      brand: model.brand,
      href: model.page ?? `${categoryHref(slug)}#${model.id}`,
      lineup: model,
    }));
  };

  /* One tab per navbar category (data/categories.ts), then About, which also
     holds contact and support: all eight did not fit on one line in Thai. */
  const navLinks: NavItem[] = [
    ...navCategories.map((category) => ({
      label: tc(`${category.slug}.nav`),
      category: category.slug,
      models: modelsFor(category.slug),
      current: currentCategory === category.slug,
    })),
    {
      label: t("about"),
      current: inAbout,
      groups: [
        {
          heading: t("groupChoose"),
          items: [{ label: t("finder"), href: "/recommend", icon: Compass }],
        },
        {
          heading: t("groupCompany"),
          items: [
            // The full page first; the two below are still homepage anchors.
            { label: t("aboutUs"), href: "/about", icon: Building2 },
            { label: t("aboutStory"), href: "/#about", icon: BookOpen },
            { label: t("aboutPartners"), href: "/#about", icon: Handshake },
          ],
        },
        {
          heading: t("groupContact"),
          items: [
            { label: t("contactSales"), href: "/contact-sales", icon: Headset },
            { label: t("contactTouch"), href: "/#contact", icon: MessageCircle },
            { label: t("contactDemo"), href: "/products/request-a-demo", icon: CalendarDays },
            { label: t("contactLocations"), href: "/location", icon: MapPin },
            { label: t("support"), href: "/#support", icon: LifeBuoy },
          ],
        },
      ],
    },
  ];

  /* The accent track along the bar's bottom edge (styles: .nav-track in
     globals.css). It glides to the tab under the pointer or keyboard focus,
     stays under a tab while its menu is open, and otherwise rests under the
     current section — or fades out where there isn't one. Positioned straight
     on the DOM, so following the pointer never re-renders the navbar. It is
     placed against the <header>, its containing block. */
  const headerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);
  const [pointed, setPointed] = useState<number | null>(null);
  const currentIndex = navLinks.findIndex((link) => link.current);
  const trackTarget = pointed ?? desktopMenu ?? (currentIndex >= 0 ? currentIndex : null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    const track = trackRef.current;
    if (!header || !track) return;
    const place = (glide: boolean) => {
      const trigger = trackTarget === null ? null : triggerRefs.current[trackTarget];
      if (!trigger || !trigger.offsetParent) {
        track.dataset.shown = "false";
        return;
      }
      const h = header.getBoundingClientRect();
      const r = trigger.getBoundingClientRect();
      const left = r.left - h.left;
      const wasShown = track.dataset.shown === "true";
      track.dataset.dir = left >= parseFloat(track.style.left || "0") ? "right" : "left";
      // appearing (or the window resizing): jump into place, don't glide there
      track.dataset.instant = String(!glide || !wasShown);
      track.style.left = `${left}px`;
      track.style.right = `${h.right - r.right}px`;
      track.dataset.shown = "true";
    };
    place(true);
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [trackTarget, locale]);

  return (
    <>
    <header
      ref={headerRef}
      data-clear={clear}
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-forest-100 bg-surface/85 shadow-[0_8px_28px_-16px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          : "border-forest-100/70 bg-surface"
      }`}
    >
      <span ref={trackRef} aria-hidden="true" className="nav-track hidden xl:block" />
      {/* The bar's background spans the screen; its contents sit in the same
          centred column as the page (max-w-7xl, same padding), DJI-style, so
          on wide screens the logo lines up with the hero title and the quote
          button with the hero's quote card instead of hugging the edges.
          Not positioned: the category panels and the track are placed against
          the <header>, so a panel can span the full width. */}
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* left group: logo + tabs. Full height, so each tab's hover area runs
            down to the bar's bottom edge, where its panel starts. */}
        <div className="flex items-center gap-4 self-stretch xl:gap-7">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="FindMyRobo home">
          <Image
            src="/main-logo-light.png"
            alt="FindMyRobo"
            width={1200}
            height={320}
            priority
            // a touch smaller from xl, where it shares the bar with the tabs
            className="nav-logo-on-light h-10 w-auto sm:h-12 xl:h-10"
          />
          {/* the white version, for the clear bar over the hero */}
          <Image
            src="/main-logo-dark.png"
            alt=""
            width={1200}
            height={320}
            priority
            className="nav-logo-on-dark h-10 w-auto sm:h-12 xl:h-10"
          />
        </Link>

        {/* desktop tabs — from xl; below that they are in the drawer */}
        <ul
          className="hidden gap-5 self-stretch xl:flex"
          onMouseLeave={() => setPointed(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPointed(null);
          }}
        >
          {navLinks.map((link, linkIndex) => {
            const isOpen = desktopMenu === linkIndex;
            return (
              <li
                key={link.label}
                // A category's panel spans the whole header, so its <li> must
                // not become the panel's containing block; the About dropdown
                // hangs from its own tab.
                className={`flex items-center ${link.category ? "static" : "relative"}`}
                onMouseEnter={() => {
                  setPointed(linkIndex);
                  openMenu(linkIndex);
                }}
                onFocus={() => setPointed(linkIndex)}
                onMouseLeave={scheduleCloseMenu}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeMenu();
                    (event.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
                  }
                }}
              >
                <button
                  ref={(el) => {
                    triggerRefs.current[linkIndex] = el;
                  }}
                  type="button"
                  onClick={() => {
                    if (menuCloseTimer.current) clearTimeout(menuCloseTimer.current);
                    setDesktopMenu((current) => (current === linkIndex ? null : linkIndex));
                  }}
                  aria-expanded={isOpen}
                  className={`flex cursor-pointer items-center gap-1 whitespace-nowrap py-2 text-[14px] font-semibold transition-colors hover:text-content ${
                    link.current || isOpen ? "text-content" : "text-content/80"
                  }`}
                >
                  {link.label}
                  {link.groups && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-accent-600 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>

                {link.category && link.models ? (
                  // DJI-style: a full-width panel of the category's models,
                  // laid out in the page column like the bar above it.
                  <div
                    className={`absolute inset-x-0 top-full z-50 transition-all duration-200 ${
                      isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="border-t border-forest-100 bg-surface shadow-[0_28px_48px_-28px_rgba(0,0,0,0.35)]">
                      <div className="mx-auto flex max-w-7xl gap-10 px-8 py-8">
                        <div className="w-56 shrink-0">
                          <p className="font-display text-xl font-extrabold tracking-tight text-content">
                            {tc(`${link.category}.name`)}
                          </p>
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                            {tc(`${link.category}.description`)}
                          </p>
                          <Link
                            href={categoryHref(link.category)}
                            onClick={closeMenu}
                            className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent-600 transition-colors hover:text-content"
                          >
                            {t("viewAll")}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                        <ul className="grid flex-1 grid-cols-5 gap-4">
                          {link.models.map((model) => (
                            <li key={model.key}>
                              <Link
                                href={model.href}
                                onClick={closeMenu}
                                className="flex h-full flex-col rounded-xl border border-forest-100 bg-cloud/50 p-3 transition hover:-translate-y-0.5 hover:border-accent-600/40 hover:bg-surface hover:shadow-md"
                              >
                                <span className="relative flex h-28 items-center justify-center">
                                  {model.product ? (
                                    <ProductVisual product={model.product} className="h-full w-full" />
                                  ) : (
                                    <ModelTile
                                      category={link.category!}
                                      image={model.lineup?.image}
                                      className="h-full w-full"
                                    />
                                  )}
                                </span>
                                {model.brand && (
                                  <span className={`mt-2.5 ${groupHeadingClass}`}>{model.brand}</span>
                                )}
                                <span
                                  className={`${
                                    model.brand ? "mt-0.5" : "mt-2.5"
                                  } line-clamp-2 text-[13px] leading-snug font-bold text-content`}
                                >
                                  {model.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : link.groups ? (
                  <div
                    className={`absolute top-full left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
                      isOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="grid w-[33rem] grid-cols-2 gap-2 overflow-hidden rounded-xl border border-forest-100 bg-surface/95 p-2.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                      {link.groups.map((group) => (
                        <div key={group.heading}>
                          <p className={`px-2.5 pt-1.5 pb-2 ${groupHeadingClass}`}>{group.heading}</p>
                          {group.items.map((item) => (
                            <DropdownChild key={item.label} item={item} onNavigate={closeMenu} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        </div>

        {/* right cluster — tight on phones, given more air from lg */}
        <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
          {/* A fixed 44px slot for the search: the field opens leftwards over
              the tabs (on hover or focus) instead of widening the bar and
              shoving the tabs aside. */}
          <div className="relative hidden h-11 w-11 shrink-0 xl:block">
            {/* Anchored by its right edge, so it grows leftwards. The anchor
                is this wrapper, not CatalogSearch itself: its root is always
                `relative`, which beat an `absolute` passed in, and the field
                grew rightwards over the buttons. */}
            <div className="absolute top-0 right-0 z-10">
              <CatalogSearch
                className="group"
                inputClassName="h-11 w-11 cursor-pointer rounded-full border border-forest-100 bg-cloud pl-10 pr-0 text-[13px] text-content placeholder:text-ink-muted/70 transition-all duration-300 group-hover:w-64 group-hover:cursor-text group-hover:pr-4 focus:w-64 focus:cursor-text focus:pr-4 focus:border-accent-600/60 focus:bg-surface focus:outline-none"
                dropdownClassName="right-0 w-[360px]"
              />
            </div>
          </div>

          <LanguageSwitcher className="hidden md:flex" />

          {/* sign in / account */}
          <ProfileMenu />

          {siteConfig.cartEnabled ? (
            <button
              type="button"
              onClick={openDrawer}
              aria-label={t(
                siteConfig.showPrices ? "cartLabel" : "quotationLabel",
                { count }
              )}
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-content transition-colors hover:bg-cloud hover:text-accent-600"
            >
              <CartIcon className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 font-mono text-[10px] font-bold text-on-accent">
                  {count}
                </span>
              )}
            </button>
          ) : (
            // Cart switched off: the same spot opens the quote form instead —
            // the site's one call to action, so it's the one accent-coloured thing on the
            // bar: a labelled pill from sm, an accent disc on phones.
            <button
              type="button"
              onClick={() => openQuote()}
              className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent-gradient px-3 text-[13.5px] font-bold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-5"
            >
              <CartIcon className="h-[18px] w-[18px] shrink-0" />
              <span className="max-sm:sr-only">{t("getQuote")}</span>
            </button>
          )}

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
    </header>

      {/* drawer (below xl) — rendered OUTSIDE <header>: when scrolled the
          header gets backdrop-blur, which would otherwise become the
          containing block for these position:fixed elements and clip the
          drawer to the header's height instead of the viewport. */}
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
                <Image
                  src="/main-logo-light.png"
                  alt="FindMyRobo"
                  width={1200}
                  height={320}
                  className="h-8 w-auto"
                />
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
                  inputClassName="h-12 w-full rounded-full border border-forest-100 bg-cloud pl-10 pr-4 text-sm text-content placeholder:text-ink-muted/70 focus:border-accent-600/60 focus:bg-surface focus:outline-none"
                  dropdownClassName="inset-x-0 w-full"
                  onNavigate={() => setOpen(false)}
                />
                <p className={`mb-1 px-4 ${groupHeadingClass}`}>{t("productsHeading")}</p>
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.04, duration: 0.3 }}
                    >
                      {/* the categories, then a rule before About */}
                      {!link.category && <div className="mx-4 my-3 h-px bg-forest-100" aria-hidden="true" />}
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        aria-expanded={expanded === i}
                        className="flex min-h-[48px] w-full cursor-pointer items-center justify-between rounded-xl px-4 text-left text-[15px] font-bold text-content transition-colors hover:bg-cloud hover:text-accent-600"
                      >
                        {link.label}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-accent-600 transition-transform duration-200 ${
                            expanded === i ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden pl-4"
                          >
                            {link.category && link.models ? (
                              <ul>
                                {link.models.map((model) => (
                                  <li key={model.key}>
                                    <Link
                                      href={model.href}
                                      onClick={() => setOpen(false)}
                                      className="flex min-h-[44px] flex-col justify-center rounded-lg px-4 py-2 text-[14px] text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600"
                                    >
                                      <span>
                                        {model.lineup ? lineupModelName(model.lineup) : model.name}
                                      </span>
                                      {model.lineup && (
                                        <ConditionLine conditions={model.lineup.conditions} />
                                      )}
                                    </Link>
                                  </li>
                                ))}
                                <li>
                                  <Link
                                    href={categoryHref(link.category)}
                                    onClick={() => setOpen(false)}
                                    className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold text-accent-600 transition-colors hover:bg-cloud"
                                  >
                                    {t("viewAll")}
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                  </Link>
                                </li>
                              </ul>
                            ) : (
                              link.groups?.map((group) => (
                                <div key={group.heading} className="pb-1">
                                  <p className={`px-4 pt-3 pb-1 ${groupHeadingClass}`}>{group.heading}</p>
                                  <ul>
                                    {group.items.map((item) => (
                                      <li key={item.label}>
                                        <Link
                                          href={item.href}
                                          onClick={() => setOpen(false)}
                                          className="flex min-h-[44px] items-center rounded-lg px-4 text-[14px] text-ink-muted transition-colors hover:bg-cloud hover:text-accent-600"
                                        >
                                          {item.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-3 border-t border-forest-100 pt-6">
                  <LanguageSwitcher className="w-fit" />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
