"use client";

import { useEffect, useState } from "react";
import type { Gallery, GalleryCategory } from "@lib/types";

interface Props {
  items: Gallery[];
  categoryLabels: Record<GalleryCategory, string>;
}

export default function GalleryLightbox({ items, categoryLabels }: Props) {
  const [active, setActive] = useState<Gallery | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const idx = items.findIndex((i) => i.id === active.id);
        if (idx === -1) return;
        const next = e.key === "ArrowRight"
          ? items[(idx + 1) % items.length]
          : items[(idx - 1 + items.length) % items.length];
        setActive(next);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, items]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {items.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g)}
            className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 group focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img
              src={g.imageUrl}
              alt={g.title}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 text-left">
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
                {categoryLabels[g.category] ?? g.category}
              </span>
              <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2 mt-0.5">
                {g.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActive(null); }}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 text-xl"
            aria-label="Tutup"
          >
            ✕
          </button>
          <img
            src={active.imageUrl}
            alt={active.title}
            className="max-h-[80vh] max-w-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="mt-4 max-w-2xl text-white text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-block text-[10px] uppercase tracking-wider text-white/70 font-semibold mb-1">
              {categoryLabels[active.category] ?? active.category}
            </span>
            <h3 className="font-bold text-lg">{active.title}</h3>
            {active.caption && (
              <p className="mt-1 text-sm text-white/80 italic">{active.caption}</p>
            )}
            {active.description && (
              <p className="mt-2 text-sm text-white/90">{active.description}</p>
            )}
            <p className="mt-3 text-xs text-white/60">
              {active.takenAt && new Date(active.takenAt).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric",
              })}
              {active.takenAt && active.location && " · "}
              {active.location && `📍 ${active.location}`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
