"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignFormData {
  id?: string;
  slug: string;
  title: string;
  description: string;
  type: "uang" | "mushaf";
  targetAmount: number;
  active: boolean;
  endDate?: string;
  coverImage?: string;
}

interface Props {
  initial?: CampaignFormData;
  mode: "create" | "edit";
}

export default function CampaignForm({ initial, mode }: Props) {
  const router = useRouter();
  const [data, setData] = useState<CampaignFormData>(
    initial ?? {
      slug: "",
      title: "",
      description: "",
      type: "uang",
      targetAmount: 1_000_000,
      active: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal");
      update("coverImage", json.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = mode === "create"
        ? "/api/admin/campaigns"
        : `/api/admin/campaigns/${data.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal simpan");
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (!confirm(`Yakin hapus campaign "${data.title}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${data.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal hapus");
      }
      router.push("/admin/campaigns");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="card space-y-4">
        <div>
          <label className="label">Judul</label>
          <input required className="input" value={data.title}
            onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="label">Slug (URL)</label>
          <input required pattern="[a-z0-9-]+" className="input font-mono" value={data.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="contoh: santunan-yatim-2026" />
          <p className="mt-1 text-xs text-slate-500">Hanya huruf kecil, angka, dan tanda hubung.</p>
        </div>
        <div>
          <label className="label">Deskripsi</label>
          <textarea required rows={4} className="input" value={data.description}
            onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Jenis</label>
            <select className="input" value={data.type}
              onChange={(e) => update("type", e.target.value as "uang" | "mushaf")}>
              <option value="uang">Donasi Uang</option>
              <option value="mushaf">Wakaf Mushaf</option>
            </select>
          </div>
          <div>
            <label className="label">Target (IDR)</label>
            <input required type="number" min={10000} step={1000} className="input"
              value={data.targetAmount}
              onChange={(e) => update("targetAmount", Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label">Tanggal Berakhir (opsional)</label>
          <input type="date" className="input"
            value={data.endDate?.slice(0, 10) ?? ""}
            onChange={(e) => update("endDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
            checked={data.active}
            onChange={(e) => update("active", e.target.checked)} />
          Tampilkan di landing page (aktif)
        </label>
      </div>

      <div className="card">
        <label className="label">Cover Image</label>
        {data.coverImage && (
          <img src={data.coverImage} alt="" className="mt-2 mb-3 h-32 w-full object-cover rounded-lg" />
        )}
        <input type="file" accept="image/*"
          onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
          className="block w-full text-sm" />
        {uploading && <p className="mt-2 text-xs text-slate-500">Mengupload...</p>}
        <p className="mt-2 text-xs text-slate-500">Max 5MB. PNG/JPG/WEBP.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Menyimpan..." : mode === "create" ? "Buat Campaign" : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Batal
          </button>
        </div>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} disabled={submitting}
            className="text-sm text-red-600 hover:text-red-700">
            Hapus campaign
          </button>
        )}
      </div>
    </form>
  );
}
