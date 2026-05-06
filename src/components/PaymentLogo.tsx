/**
 * Payment logo dengan fallback chain:
 *   1. /public/payment-logos/{slug}.svg  ← prioritas (logo asli SVG)
 *   2. /public/payment-logos/{slug}.png  ← fallback PNG
 *   3. children                          ← stylized inline SVG fallback
 *
 * Pakai inline style (bukan Tailwind class) untuk sizing supaya tidak
 * kena CSS specificity issue. Logo PNG dari Figma library biasanya
 * punya internal padding + card bg → kita kasih slot fixed-size kecil
 * supaya tidak ngebanjirin footer.
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

// Inline style — guaranteed apply, no Tailwind class purge surprises
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

export default function PaymentLogo({
  slug,
  alt,
  children,
  variant = "default",
}: PaymentLogoProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  if (stage === 2) {
    return <span className="inline-flex items-center">{children}</span>;
  }

  const ext = stage === 0 ? "svg" : "png";

  return (
    <img
      src={`/payment-logos/${slug}.${ext}`}
      alt={alt}
      style={STYLE[variant]}
      decoding="async"
      onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
    />
  );
}
