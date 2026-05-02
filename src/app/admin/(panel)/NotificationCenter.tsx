"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NotifPaid {
  orderId: string;
  donor: string;
  amount: number;
  type: "uang" | "mushaf";
  paidAt: string;
  isManual: boolean;
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STORAGE_KEY = "donasi:lastSeenAt";
const POLL_INTERVAL_MS = 15_000;

export default function NotificationCenter() {
  const router = useRouter();
  const [unread, setUnread] = useState<NotifPaid[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<NotifPaid | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  function getLastSeen(): string {
    if (typeof window === "undefined") return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return localStorage.getItem(STORAGE_KEY) ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }

  function setLastSeen(iso: string) {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, iso);
  }

  async function poll() {
    try {
      const since = getLastSeen();
      const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(since)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      const items: NotifPaid[] = json.newPaid ?? [];
      setPendingCount(json.newPending ?? 0);

      // Filter yang benar-benar baru (belum pernah ditampilkan dalam session ini)
      const fresh = items.filter((n) => !seenIdsRef.current.has(n.orderId));
      if (fresh.length > 0) {
        setUnread((prev) => {
          const merged = [...fresh, ...prev];
          // Dedup by orderId, max 50
          const map = new Map<string, NotifPaid>();
          for (const n of merged) map.set(n.orderId, n);
          return Array.from(map.values()).slice(0, 50);
        });
        // Toast donasi paling baru
        const latest = fresh[0];
        setToast(latest);
        // Beep sederhana via Web Audio API
        playBeep();
        // Auto-hide toast after 8s
        setTimeout(() => setToast(null), 8000);
        // Tandai sebagai sudah dilihat (di session, bukan persistent)
        for (const n of fresh) seenIdsRef.current.add(n.orderId);
      }
    } catch {}
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function markAllSeen() {
    const now = new Date().toISOString();
    setLastSeen(now);
    setUnread([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* Bell di sidebar atas */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          aria-label="Notifikasi"
          title="Notifikasi"
        >
          🔔
          {unread.length > 0 && (
            <span className="absolute -top-1 -right-1 grid min-w-[18px] h-[18px] place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {unread.length > 99 ? "99+" : unread.length}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white">
              <p className="font-bold">Notifikasi</p>
              {unread.length > 0 && (
                <button onClick={markAllSeen} className="text-xs text-primary hover:underline">
                  Tandai semua dibaca
                </button>
              )}
            </div>
            {pendingCount > 0 && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-800">
                ⏳ {pendingCount} donasi pending menunggu pembayaran
              </div>
            )}
            {unread.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Tidak ada notifikasi baru.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {unread.map((n) => (
                  <li key={n.orderId}>
                    <Link
                      href={`/admin/donations/${n.orderId}`}
                      className="block px-4 py-3 hover:bg-slate-50"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0">
                          {n.type === "mushaf" ? "📖" : "💚"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{n.donor}</p>
                          <p className="text-xs text-primary font-bold mt-0.5">{idr(n.amount)}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                            {n.orderId}
                          </p>
                        </div>
                        {n.isManual && (
                          <span className="text-[10px] rounded-full bg-slate-100 text-slate-600 px-1.5 py-0.5">
                            manual
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Toast popup di sudut kanan bawah */}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-[60] animate-slide-in">
          <div className="bg-primary text-white rounded-xl shadow-xl p-4 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-xl">
              💰
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm">Donasi Masuk!</p>
              <p className="mt-0.5 text-sm">
                <span className="font-semibold">{toast.donor}</span> — {idr(toast.amount)}
              </p>
              <Link
                href={`/admin/donations/${toast.orderId}`}
                className="inline-block mt-2 text-xs font-semibold underline"
                onClick={() => setToast(null)}
              >
                Lihat detail →
              </Link>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
