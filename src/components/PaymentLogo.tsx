/**
 * Payment logo dengan fallback chain disederhanakan:
 *   1. /public/payment-logos/{slug}.png  ← langsung PNG (yang kita punya)
 *   2. children                          ← stylized inline SVG fallback
 *
 * Sebelumnya: try .svg → onError → switch .png → onError → fallback.
 * Tapi: kita ga punya file .svg di repo, jadi setiap logo SELALU
 * fail di stage 0, trigger 26 requests + 26 onError chains untuk 13
 * logo. Browser cache 404 SVG persist ber-jam-jam → setelah cache,
 * onError tidak re-fire → stage stuck di 0 → broken image persist.
 *
 * Fix: skip SVG attempt entirely. Single PNG request per logo.
 * Kalau user tetap mau SVG di masa depan, bisa convert PNG → SVG
 * dan replace file di /public/payment-logos/.
 *
 * Tambahan optimasi:
 * - width & height attributes (CLS = 0, no layout shift)
 * - decoding async (non-blocking parsing)
 * - fetchPriority low (footer logos = below fold, low priority)
 */
"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

interface PaymentLogoProps {
  slug: string;
  alt: string;
  children: ReactNode;
  variant?: "default" | "lg";
}

const STYLE: Record<NonNullable<PaymentLogoProps["variant"]>, CSSProperties> = {
  default: {
    height: 32,
    width: "auto",
    maxWidth: 64,
    objectFit: "contain",
  },
  lg: {
    height: 24,
    width: "auto",
    maxWidth: 80,
    objectFit: "contain",
  },
};

// Native HTML width/height untuk CLS stability — pakai max dimensions
const HW: Record<NonNullable<PaymentLogoProps["variant"]>, { w: number; h: number }> = {
  default: { w: 64, h: 32 },
  lg: { w: 80, h: 24 },
};

export default function PaymentLogo({
  slug,
  alt,
  children,
  variant = "default",
}: PaymentLogoProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <span className="inline-flex items-center">{children}</span>;
  }

  const { w, h } = HW[variant];

  return (
    <img
      src={`/payment-logos/${slug}.png`}
      alt={alt}
      width={w}
      height={h}
      style={STYLE[variant]}
      decoding="async"
      // @ts-expect-error — fetchPriority is valid HTML attribute, baru di React 19
      fetchpriority="low"
      onError={() => setErrored(true)}
    />
  );
}
