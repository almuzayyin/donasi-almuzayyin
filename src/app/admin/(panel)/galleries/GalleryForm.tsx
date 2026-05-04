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
  const [dragOver, setDragOver] = useState(false);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  const MAX_BYTES = 5 * 1024 * 1024;

  function validateFile(file: File): string | null {
    if (!ALLOWED.includes(file.type)) {
      return `Format tidak didukung: ${file.type || "unknown"} (PNG/JPG/WebP/GIF saja)`;
    }
    if (file.size > MAX_BYTES) {
      return `File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB, max 5MB)`;
    }
    return null;
  }

  async function onUpload(file: File) {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
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

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragOver) setDragOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  // Paste image from clipboard (Ctrl+V) — bonus UX
  async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    const file = item.getAsFile();
    if (file) onUpload(file);
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
      {/* Upload Foto — drag & drop + click + paste */}
      <div className="card">
        <label className="label">Foto *</label>
        {data.imageUrl ? (
          <div
            className={`space-y-2 rounded-lg p-2 transition ${
              dragOver ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onPaste={onPaste}
          >
            <div className="relative">
              <img
                src={data.imageUrl}
                alt="Preview"
                className="max-h-64 rounded border border-slate-200"
              />
              {dragOver && (
                <div className="absolute inset-0 grid place-items-center bg-primary/80 text-white font-semibold rounded pointer-events-none">
                  📥 Drop untuk ganti foto
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
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
              <span className="text-xs text-slate-500 ml-auto">
                💡 Drag-drop / paste (Ctrl+V) foto baru untuk ganti
              </span>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !uploading) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onPaste={onPaste}
            aria-busy={uploading}
            aria-disabled={uploading}
            className={`w-full border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
              dragOver
                ? "border-primary bg-primary/10 scale-[1.01]"
                : uploading
                ? "border-slate-200 bg-slate-50 cursor-wait"
                : "border-slate-300 hover:border-primary hover:bg-slate-50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-700">Mengunggah...</p>
              </div>
            ) : dragOver ? (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <span className="text-5xl">📥</span>
                <p className="font-semibold text-primary">Drop foto di sini</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <span className="text-4xl sm:text-5xl">📸</span>
                <p className="font-semibold text-slate-700">
                  Drag & drop foto ke sini
                </p>
                <p className="text-xs text-slate-500">
                  atau{" "}
                  <span className="text-primary underline">klik untuk pilih</span>
                  {" "}/ paste (Ctrl+V)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  PNG, JPG, WebP, GIF · max 5MB
                </p>
              </div>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            // reset value supaya bisa upload file yang sama lagi
            e.target.value = "";
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
