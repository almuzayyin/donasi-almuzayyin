import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yayasanislamalmuzayin.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yayasan Islam Al Muzayyin Gadung — Mencetak Generasi Qur'ani",
    template: "%s — Yayasan Al Muzayyin",
  },
  description:
    "Salurkan donasi, wakaf mushaf Al-Qur'an, santunan yatim, donasi pembangunan, dan wakaf tanah untuk Yayasan Islam Al Muzayyin Gadung. Berbadan hukum, transparan, aman.",
  keywords: [
    "Yayasan Al Muzayyin",
    "Donasi",
    "Wakaf Al-Qur'an",
    "Santunan Yatim",
    "Tahfidz",
    "Pondok Pesantren",
    "Gadung",
    "Driyorejo",
    "Gresik",
  ],
  authors: [{ name: "Yayasan Islam Al Muzayyin Gadung" }],
  // Favicons & app icons — fallback ke placeholder SVG kalau /logo.png belum ada
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo-placeholder.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Yayasan Islam Al Muzayyin Gadung",
    title: "Yayasan Islam Al Muzayyin Gadung — Mencetak Generasi Qur'ani",
    description:
      "Donasi, wakaf, dan santunan untuk Pondok Pesantren, SMP, SMA Tahfidzul Qur'an Al Muzayyin Gadung.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Logo Yayasan Al Muzayyin" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yayasan Islam Al Muzayyin Gadung",
    description: "Mencetak Generasi Qur'ani — Donasi, wakaf, santunan tepercaya.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f5132",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
