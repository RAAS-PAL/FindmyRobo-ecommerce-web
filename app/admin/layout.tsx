import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";
import "../globals.css";

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
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cloud">{children}</body>
    </html>
  );
}
