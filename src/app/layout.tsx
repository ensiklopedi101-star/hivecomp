import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hivecomp.my.id"),
  title: "HiveComp — Lima Brand, Satu Pintu Masuk",
  description:
    "HiveComp menyatukan PopBeez, NusaBeez, Portal-Hub, BlinkBeez, dan E-Beez dalam satu halaman — satu pintu masuk untuk seluruh kanal dan produk.",
  keywords: [
    "HiveComp",
    "PopBeez",
    "NusaBeez",
    "Portal-Hub",
    "BlinkBeez",
    "E-Beez",
    "media digital",
    "news aggregator",
    "grup media dan commerce",
  ],
  alternates: { canonical: "https://www.hivecomp.my.id" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "HiveComp — Lima Brand, Satu Pintu Masuk",
    description:
      "PopBeez, NusaBeez, Portal-Hub, BlinkBeez, dan E-Beez dalam satu halaman.",
    type: "website",
    locale: "id_ID",
    url: "https://www.hivecomp.my.id",
    siteName: "HiveComp",
  },
  twitter: {
    card: "summary_large_image",
    title: "HiveComp — Lima Brand, Satu Pintu Masuk",
    description:
      "Lima brand media & commerce dalam satu halaman: PopBeez, NusaBeez, Portal-Hub, BlinkBeez, E-Beez.",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HiveComp",
  url: "https://www.hivecomp.my.id",
  description:
    "Grup media dan commerce yang menaungi PopBeez, NusaBeez, Portal-Hub, BlinkBeez, dan E-Beez.",
};

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${display.variable} ${inter.variable} ${mono.variable}`}
    >
      <body className="bg-ink font-sans text-stone-100 antialiased">
        <a href="#konten" className="skip-link">
          Lewati ke konten
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Film grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url("${GRAIN}")` }}
        />
      </body>
    </html>
  );
}
