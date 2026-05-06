/**
 * Mobile hamburger drawer untuk navigasi publik.
 *
 * Hanya tampil di mobile (md:hidden). Drawer slide dari kanan dengan
 * backdrop fade. ESC + tap backdrop = close. Body scroll di-lock saat
 * drawer open agar tidak scroll-through.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda", icon: "🏠" },
  { href: "/donasi", label: "Donasi", icon: "💝" },
  { href: "/galeri", label: "Galeri Kegiatan", icon: "🖼️" },
  { href: "/transparansi", label: "Transparansi", icon: "📊" },
  { href: "/tentang", label: "Tentang Kami", icon: "ℹ️" },
  { href: "/legalitas", label: "Legalitas", icon: "⚖️" },
  { href: "/kontak", label: "Kontak", icon: "📞" },
];

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup drawer saat pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body scroll lock + ESC close
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

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Hamburger button — hanya tampil di mobile */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Buka menu"
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        style={{ touchAction: "manipulation" }}
        className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shrink-0"
      >
        {/* Hamburger icon (3 bars) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Backdrop — pakai inline style biar bg-black/opacity guaranteed apply */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          backgroundColor: open ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0)",
          pointerEvents: open ? "auto" : "none",
          transition: "background-color 200ms ease-out",
        }}
      />

      {/* Drawer */}
      <aside
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className="md:hidden bg-white shadow-2xl flex flex-col"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 50,
          height: "100vh",
          width: "85%",
          maxWidth: 340,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-200 shrink-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 min-w-0"
          >
            <Logo size={40} className="h-10 w-10 shrink-0" />
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-primary text-sm truncate">Al Muzayyin</span>
              <span className="block text-[10px] text-slate-500 truncate">
                Mencetak Generasi Qur&apos;ani
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Tutup menu"
            style={{ touchAction: "manipulation" }}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 transition shrink-0 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ pointerEvents: "none" }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-base" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick info */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
              Rekening Resmi
            </p>
            <div className="px-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900">Bank Mandiri</p>
              <p className="font-mono text-primary text-sm tracking-wide">
                140-00-3993992-2
              </p>
              <p className="text-[11px] text-slate-500">
                a.n. Yayasan Islam Al Muzayyin Gadung
              </p>
            </div>
          </div>
        </nav>

        {/* Sticky CTA bottom */}
        <div className="border-t border-slate-200 p-4 shrink-0 bg-white">
          <Link
            href="/donasi"
            onClick={() => setOpen(false)}
            className="btn-primary w-full text-center !py-3"
          >
            💝 Donasi Sekarang
          </Link>
        </div>
      </aside>
    </>
  );
}
