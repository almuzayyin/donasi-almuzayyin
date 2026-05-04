/**
 * Payment logo dengan fallback chain:
 *   1. /public/payment-logos/{slug}.svg  ← prioritas utama (logo asli SVG)
 *   2. /public/payment-logos/{slug}.png  ← fallback PNG
 *   3. children (stylized inline SVG)    ← fallback terakhir kalau file ga ada
 *
 * Tambah/ganti logo asli tanpa redeploy code: cukup drop file ke
 * /public/payment-logos/. File dengan slug yang sama auto-replace fallback.
 *
 * Catatan: pakai `children` (bukan komponen sebagai prop) supaya bisa
 * di-render dari Server Component — React element serializable lewat
 * server/client boundary, function reference tidak.
 */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface PaymentLogoProps {
  slug: string;
  alt: string;
  children: ReactNode; // fallback content (mis. <VisaLogo />)
}

export default function PaymentLogo({ slug, alt, children }: PaymentLogoProps) {
  // 0: try .svg, 1: try .png, 2: render children fallback
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return <>{children}</>;
  }

  const ext = stage === 0 ? "svg" : "png";

  return (
    <img
      src={`/payment-logos/${slug}.${ext}`}
      alt={alt}
      className="h-7 sm:h-8 w-auto object-contain"
      loading="lazy"
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
    />
  );
}
