"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SignOutButton from "./SignOutButton";
import NotificationCenter from "./NotificationCenter";
import Logo from "@/components/Logo";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface Props {
  user: { email: string } | null;
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function PanelShell({ user, navItems, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup drawer saat ganti halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={36} className="h-9 w-9" />
          <span className="font-bold text-primary text-sm">Al Muzayyin</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-xl"
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Desktop top bar (only notification bell) */}
      <div className="hidden md:flex fixed top-4 right-4 z-30">
        <NotificationCenter />
      </div>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky md:translate-x-0 top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size={36} className="h-9 w-9" />
            <div className="leading-tight">
              <p className="font-bold text-primary text-sm">Al Muzayyin</p>
              <p className="text-[10px] text-slate-500">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-slate-500 hover:text-slate-700"
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-200">
          {user && (
            <>
              <p className="text-xs text-slate-500 mb-1">Login sebagai</p>
              <p className="text-sm font-medium text-slate-900 truncate" title={user.email}>
                {user.email}
              </p>
              <SignOutButton />
            </>
          )}
          <Link href="/" className="mt-2 block text-xs text-slate-500 hover:text-primary">
            ← Kembali ke situs
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 pt-14 md:pt-0">
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
