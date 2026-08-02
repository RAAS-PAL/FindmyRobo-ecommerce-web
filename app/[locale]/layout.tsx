import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Barlow, IBM_Plex_Mono, Noto_Sans_Thai, Prompt } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/MotionProvider";
import { themeInitScript } from "@/components/ThemeProvider";
import ProductsProvider from "@/components/ProductsProvider";
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import CompareProvider from "@/components/compare/CompareProvider";
import FloatingCompareButton from "@/components/compare/FloatingCompareButton";
import { getAllProducts } from "@/lib/productStore";

// Barlow is not a variable font — list the weights the UI uses (body through
// the extrabold headings). Powers both --font-sans and --font-display.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Thai script fallbacks — Barlow has no Thai glyphs */
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700", "800"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const products = await getAllProducts();

  return (
    // suppressHydrationWarning: themeInitScript sets the .dark class on <html>
    // before React hydrates, so the server/client class lists differ by design.
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${barlow.variable} ${plexMono.variable} ${prompt.variable} ${notoSansThai.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Runs synchronously during body parse (before the page paints) to set
            the .dark class and avoid a theme flash. Kept out of <head>: React 19
            owns the head singleton and re-mounts inline scripts placed there on
            the client, which both fails to run them and logs a "script tag"
            warning. As a plain body element it hydrates in place instead. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <ProductsProvider products={products}>
              <CartProvider>
                <CompareProvider>
                  <AnnouncementBar />
                  <Navbar />
                  {children}
                  <Footer />
                  <CartDrawer />
                  <FloatingCompareButton />
                </CompareProvider>
              </CartProvider>
            </ProductsProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
