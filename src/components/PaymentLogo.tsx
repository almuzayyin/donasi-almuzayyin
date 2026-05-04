/**
 * Payment logo dengan fallback chain:
 *   1. /public/payment-logos/{slug}.svg  ← prioritas utama (logo asli SVG)
 *   2. /public/payment-logos/{slug}.png  ← fallback PNG
 *   3. Stylized inline SVG component     ← fallback terakhir kalau file ga ada
 *
 * Tambah/ganti logo asli tanpa redeploy code: cukup drop file ke
 * /public/payment-logos/. File dengan slug yang sama auto-replace
 * fallback stylized.
 *
 * Sumber logo resmi (rekomendasi):
 * - Visa:        usa.visa.com/run-your-business/small-business-tools/.../visa-brand-resources
 * - Mastercard:  brand.mastercard.com
 * - JCB:         global.jcb/en/about-us/brand-concept/
 * - BCA/Mandiri/BNI/BRI: situs resmi atau Midtrans docs payment-channel-icon
 * - GoPay/OVO/DANA/ShopeePay/QRIS: brand kit masing-masing
 * - Midtrans accepts you to use their bundled payment icons:
 *   docs.midtrans.com → Payment Methods → Logo Assets
 */
"use client";

import { useState } from "react";
import type { ComponentType } from "react";

interface PaymentLogoProps {
  slug: string;
  alt: string;
  fallback: ComponentType;
}

export default function PaymentLogo({ slug, alt, fallback: Fallback }: PaymentLogoProps) {
  // 0: try .svg, 1: try .png, 2+: use fallback component
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return <Fallback />;
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
