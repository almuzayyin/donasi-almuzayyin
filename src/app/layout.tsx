import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yayasan Islam Al Muzayyin Gadung — Sedekah, Wakaf & Santunan",
  description:
    "Salurkan donasi, wakaf mushaf Al-Qur'an, santunan yatim, donasi pembangunan, dan wakaf tanah untuk Yayasan Islam Al Muzayyin Gadung.",
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
