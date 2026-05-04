/**
 * Payment logo dengan fallback chain:
 *   1. /public/payment-logos/{slug}.svg  ← prioritas utama (logo asli SVG)
 *   2. /public/payment-logos/{slug}.png  ← fallback PNG
 *   3. children (stylized inline SVG)    ← fallback terakhir kalau file ga ada
 *
 * Setiap logo di-render dalam container fixed-size supaya tampilan konsisten
 * walau aspect ratio file asli bervariasi (square, landscape, portrait).
 * Image di-set object-contain → logo di-center di dalam slot.
 *
 * Variant:
 * - "default": h-10 min-w-[64px] — untuk grid footer
 * - "lg":      h-12 min-w-[80px] — untuk standalone (mis. Midtrans header)
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
  default: "h-10 sm:h-11 min-w-[60px] sm:min-w-[68px]",
  lg: "h-8 sm:h-9 min-w-[80px]",
};

export default function PaymentLogo({
  slug,
  alt,
  children,
  variant = "default",
}: PaymentLogoProps) {
  // 0: try .svg, 1: try .png, 2: render children fallback
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  const containerClass = `inline-flex items-center justify-center ${SIZES[variant]} px-1.5`;

  if (stage === 2) {
    // Fallback: stylized SVG sudah punya bg + border sendiri
    return <span className="inline-flex items-center">{children}</span>;
  }

  const ext = stage === 0 ? "svg" : "png";

  return (
    <span className={containerClass}>
      <img
        src={`/payment-logos/${slug}.${ext}`}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
        onError={() => setStage((s) => (s + 1) as 0 | 1 | 2)}
      />
    </span>
  );
}
