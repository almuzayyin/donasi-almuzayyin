"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function sync() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/donations/${orderId}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync gagal");
      setMsg(`✓ Status: ${data.donation.status}`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal sync");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={sync} disabled={loading} className="btn-primary">
        {loading ? "Syncing..." : "🔄 Sync Status"}
      </button>
      {msg && <p className="text-xs text-slate-600">{msg}</p>}
    </div>
  );
}
