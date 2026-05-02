"use client";

import { useEffect, useRef, useState } from "react";

interface FeedItem {
  donor: string;
  amount: number;
  campaign: string | null;
  paidAt: string;
  type: "uang" | "mushaf";
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function DonationFeedPopup() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [current, setCurrent] = useState<FeedItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const indexRef = useRef(0);
  const lastShowRef = useRef(0);

  // Fetch feed items every 60s
  useEffect(() => {
    if (dismissed) return;
    let mounted = true;
    async function fetchItems() {
      try {
        const res = await fetch("/api/recent-donations?limit=20");
        const json = await res.json();
        if (mounted && json.items) setItems(json.items);
      } catch {}
    }
    fetchItems();
    const interval = setInterval(fetchItems, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [dismissed]);

  // Show popup rotation
  useEffect(() => {
    if (dismissed || items.length === 0) return;

    function showNext() {
      const now = Date.now();
      if (now - lastShowRef.current < 6000) return;
      const next = items[indexRef.current % items.length];
      indexRef.current += 1;
      setCurrent(next);
      setVisible(true);
      lastShowRef.current = now;
      // Auto-hide setelah 5 detik
      setTimeout(() => setVisible(false), 5000);
    }

    // Tampilkan pertama setelah 4 detik delay (UX)
    const initial = setTimeout(showNext, 4000);
    // Lalu rotasi setiap 12 detik
    const rotate = setInterval(showNext, 12_000);
    return () => {
      clearTimeout(initial);
      clearInterval(rotate);
    };
  }, [items, dismissed]);

  if (dismissed || !current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-40 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 sm:p-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xl">
          {current.type === "mushaf" ? "📖" : "💚"}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-slate-900 truncate">
            {current.donor} <span className="font-normal text-slate-500">baru saja donasi</span>
          </p>
          <p className="font-bold text-primary mt-0.5">
            {idr(current.amount)}
            {current.campaign && (
              <span className="font-normal text-slate-600 text-xs ml-1">
                untuk {current.campaign}
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(current.paidAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-700 text-lg leading-none px-1"
          aria-label="Tutup notifikasi"
        >
          ×
        </button>
      </div>
    </div>
  );
}
