"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveUserButton({ id, email }: { id: string; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm(`Hapus admin ${email}? Akun login juga akan dihapus.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal hapus");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal hapus");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "..." : "Hapus"}
    </button>
  );
}
