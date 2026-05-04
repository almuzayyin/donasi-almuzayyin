/**
 * Payment logo dengan fallback chain:
 *   1. /public/payment-logos/{slug}.svg  ← prioritas (logo asli SVG)
 *   2. /public/payment-logos/{slug}.png  ← fallback PNG
 *   3. children                          ← stylized inline SVG fallback
 *
 * Sizing dirancang ringkas — height kecil + max-width cap supaya logo
 * dengan aspect ratio bervariasi (square icon, landscape wordmark) tetap
 * proporsional dan tidak ngebanjirin column footer.
 */
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface PaymentLogoProps {
  slug: string;
  alt: string;
  children: ReactNode;
  variant?: "default" | "lg";
}

const SIZES: Record<NonNullable<PaymentLogoProps["variant"]>, string> = {
  // Logo footer (12 payment methods di grid)
  default: "h-6 sm:h-7 w-auto max-w-[52px] sm:max-w-[60px]",
  // Midtrans header — sedikit lebih lebar untuk wordmark
  lg: "h-5 sm:h-6 w-auto max-w-[72px] sm:max-w-[84px]",
};

export default function PaymentLogo({
  slug,
  alt,
  children,
  variant = "default",
}: PaymentLogoProps) {
  // 0: try .svg, 1: try .png, 2: render children fallback
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return <span className="inline-flex items-center">{children}</span>;
  }

  const ext = stage === 0 ? "svg" : "png";

  return (
    <img
      src={`/payment-logos/${slug}.${ext}`}
      alt={alt}
      className={`${SIZES[variant]} object-contain`}
      loading="lazy"
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
    />
  );
}
