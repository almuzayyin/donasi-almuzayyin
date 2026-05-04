"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryCategory } from "@lib/types";

interface FormData {
  id?: string;
  title: string;
  description: string;
  category: GalleryCategory;
  imageUrl: string;
  caption: string;
  takenAt: string;
  location: string;
  sortOrder: number | "";
  published: boolean;
  isDocument: boolean;
}

interface Props {
  initial?: Partial<FormData> & { id?: string };
  mode: "create" | "edit";
}

const CATEGORY_OPTIONS: Array<{ value: GalleryCategory; label: string }> = [
  { value: "tahfidz", label: "Tahfidz" },
  { value: "santunan", label: "Santunan" },
  { value: "pembangunan", label: "Pembangunan" },
  { value: "pengajian", label: "Pengajian" },
  { value: "wakaf", label: "Wakaf" },
  { value: "dokumentasi", label: "Dokumentasi" },
  { value: "umum", label: "Umum" },
];

function toDateInput(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function GalleryForm({ initial, mode }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<FormData>({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: (initial?.category as GalleryCategory) ?? "umum",
    imageUrl: initial?.imageUrl ?? "",
    caption: initial?.caption ?? "",
    takenAt: toDateInput(initial?.takenAt),
    location: initial?.location ?? "",
    sortOrder: initial?.sortOrder ?? 0,
    published: initial?.published ?? true,
    isDocument: initial?.isDocument ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function onUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload gagal");
      update("imageUrl", json.publicUrl);
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
      if (!data.imageUrl) throw new Error("Foto wajib diunggah");
      const payload = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        category: data.category,
        imageUrl: data.imageUrl,
        caption: data.caption.trim() || undefined,
        takenAt: data.takenAt || undefined,
        location: data.location.trim() || undefined,
        sortOrder: data.sortOrder === "" ? 0 : Number(data.sortOrder),
        published: data.published,
        isDocument: data.isDocument,
      };
      const url = mode === "create"
        ? "/api/admin/galleries"
        : `/api/admin/galleries/${data.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
      router.push("/admin/galleries");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (!confirm("Hapus foto ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      const res = await fetch(`/api/admin/galleries/${data.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal hapus");
      router.push("/admin/galleries");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
      {/* Upload Foto */}
      <div className="card">
        <label className="label">Foto *</label>
        {data.imageUrl ? (
          <div className="space-y-2">
            <img
              src={data.imageUrl}
              alt="Preview"
              className="max-h-64 rounded border border-slate-200"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs"
                disabled={uploading}
              >
                {uploading ? "Mengunggah..." : "Ganti Foto"}
              </button>
              <button
                type="button"
                onClick={() => update("imageUrl", "")}
                className="text-xs text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition"
          >
            {uploading ? "Mengunggah..." : "📸 Klik untuk pilih foto (max 5MB)"}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
      </div>

      {/* Judul + Kategori */}
      <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Judul *</label>
          <input
            required
            type="text"
            className="input"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Mis. Pembagian Mushaf di Pondok"
          />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select
            className="input"
            value={data.category}
            onChange={(e) => update("category", e.target.value as GalleryCategory)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tanggal Foto</label>
          <input
            type="date"
            className="input"
            value={data.takenAt}
            onChange={(e) => update("takenAt", e.target.value)}
          />
        </div>
      </div>

      {/* Detail */}
      <div className="card space-y-4">
        <div>
          <label className="label">Caption Singkat</label>
          <input
            type="text"
            maxLength={300}
            className="input"
            value={data.caption}
            onChange={(e) => update("caption", e.target.value)}
            placeholder="1 kalimat untuk alt-text & overlay"
          />
        </div>
        <div>
          <label className="label">Lokasi</label>
          <input
            type="text"
            maxLength={150}
            className="input"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Mis. Pondok Pesantren Al Muzayyin, Gadung"
          />
        </div>
        <div>
          <label className="label">Deskripsi Lengkap (opsional)</label>
          <textarea
            rows={4}
            maxLength={2000}
            className="input"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Cerita di balik foto, konteks acara, dll"
          />
        </div>
      </div>

      {/* Pengaturan */}
      <div className="card space-y-3">
        <div>
          <label className="label">Urutan Tampil</label>
          <input
            type="number"
            className="input"
            value={data.sortOrder}
            onChange={(e) =>
              update("sortOrder", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="0 (default)"
          />
          <p className="text-xs text-slate-500 mt-1">
            Angka lebih besar = tampil lebih dulu. Default 0.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.published}
            onChange={(e) => update("published", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Publikasikan (tampil di galeri publik)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.isDocument}
            onChange={(e) => update("isDocument", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Tandai sebagai foto dokumen (mis. scan SK, akta) — tidak muncul di galeri kegiatan publik
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting || uploading} className="btn-primary">
          {submitting ? "Menyimpan..." : mode === "create" ? "Simpan Foto" : "Update"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} className="text-sm text-red-600 hover:underline">
            Hapus foto
          </button>
        )}
      </div>
    </form>
  );
}
