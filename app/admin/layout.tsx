import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import "../globals.css";
import { themeInitScript } from "@/components/ThemeProvider";

/* Same font variables as the storefront so theme font tokens resolve */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Admin — RoboStore TH",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The admin has its own html root (it sits outside [locale]), so it needs
    // its own copy of the pre-paint theme script — without it the panel always
    // rendered light even when the storefront was set to dark. The theme itself
    // is shared: both roots read the same localStorage key.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-cloud">{children}</body>
    </html>
  );
}
