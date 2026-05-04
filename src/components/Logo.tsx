/**
 * Logo Yayasan Islam Al Muzayyin Gadung.
 *
 * Pakai <img> biasa biar simple — Next/Image butuh konfigurasi remote pattern
 * kalau logo akhirnya di Supabase Storage. File default: /logo.png di /public.
 *
 * Fallback: kalau /logo.png belum di-upload, otomatis ke /logo-placeholder.svg
 * (komposisi SVG sederhana yang representatif sampai logo asli tersedia).
 */
"use client";

import { useState } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  src?: string; // override (mis. dari setting db)
  alt?: string;
}

export default function Logo({ size = 44, className, src, alt }: LogoProps) {
  const initial = src || "/logo.png";
  const [url, setUrl] = useState(initial);

  return (
    <img
      src={url}
      onError={() => {
        if (url !== "/logo-placeholder.svg") setUrl("/logo-placeholder.svg");
      }}
      width={size}
      height={size}
      alt={alt ?? "Logo Yayasan Islam Al Muzayyin Gadung"}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
