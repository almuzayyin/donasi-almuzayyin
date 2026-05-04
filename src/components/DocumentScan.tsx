/**
 * Document scan dengan watermark anti-fraud.
 *
 * UX:
 * - Thumbnail kecil dengan watermark CSS pattern overlay
 * - Klik → modal lightbox fullscreen, image dengan watermark masih overlay
 * - Watermark teks repeating diagonal "YAYASAN AL MUZAYYIN — DOKUMEN ASLI"
 *
 * Watermark pakai CSS:
 * - Background SVG repeating pattern (diagonal text)
 * - Pointer-events: none agar tidak block klik
 */
"use client";

import { useEffect, useState } from "react";

interface DocumentScanProps {
  imageUrl: string;
  title: string;
  caption?: string;
  description?: string;
}

const WATERMARK_TEXT = "YAYASAN AL MUZAYYIN · DOKUMEN ASLI";

// SVG dipakai sebagai background CSS — di-encode supaya bisa jadi data URL
function watermarkBg(text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200" viewBox="0 0 500 200">
    <text x="250" y="100" text-anchor="middle"
          font-family="sans-serif" font-size="20" font-weight="bold"
          fill="rgba(15,81,50,0.18)" transform="rotate(-25 250 100)">
      ${text}
    </text>
  </svg>`;
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `url("data:image/svg+xml;charset=utf-8,${encoded}")`;
}

export default function DocumentScan({
  imageUrl,
  title,
  caption,
  description,
}: DocumentScanProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const watermarkStyle: React.CSSProperties = {
    backgroundImage: watermarkBg(WATERMARK_TEXT),
    backgroundRepeat: "repeat",
    backgroundSize: "300px 120px",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block group w-full text-left rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-primary transition focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="relative aspect-[3/4] bg-slate-100">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Watermark overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={watermarkStyle}
            aria-hidden="true"
          />
          {/* Hover hint */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
            <span className="text-xs font-semibold text-white bg-primary/80 px-2 py-1 rounded">
              🔍 Lihat detail
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="font-semibold text-sm text-slate-900 line-clamp-2">{title}</p>
          {caption && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{caption}</p>
          )}
        </div>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl"
            aria-label="Tutup"
          >
            ✕
          </button>

          <div
            className="relative max-h-[85vh] max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[85vh] max-w-full object-contain rounded shadow-2xl"
            />
            {/* Watermark di lightbox juga */}
            <div
              className="absolute inset-0 pointer-events-none rounded"
              style={{
                ...watermarkStyle,
                backgroundSize: "400px 160px",
              }}
              aria-hidden="true"
            />
          </div>

          <div
            className="mt-4 max-w-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-white">{title}</h3>
            {caption && <p className="mt-1 text-sm text-white/80 italic">{caption}</p>}
            {description && (
              <p className="mt-2 text-sm text-white/90">{description}</p>
            )}
            <p className="mt-3 text-[11px] text-white/50">
              ⚠️ Dokumen ini adalah scan asli yayasan. Watermark tidak dapat dihapus.
              Verifikasi independen melalui ahu.go.id.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
