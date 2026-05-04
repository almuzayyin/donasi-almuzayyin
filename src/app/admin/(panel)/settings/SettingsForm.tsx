"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppSetting } from "@lib/types";

interface Props {
  initial: AppSetting[];
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initial.map((s) => [s.key, s.value]))
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save(key: string) {
    setSaving(key);
    setError(null);
    setSavedKey(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      setSavedKey(key);
      router.refresh();
      setTimeout(() => setSavedKey(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally {
      setSaving(null);
    }
  }

  async function uploadFile(key: string, file: File) {
    setUploading(key);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload gagal");
      setValues((prev) => ({ ...prev, [key]: json.publicUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(null);
    }
  }

  function isPriceField(key: string): boolean {
    return key.endsWith("_price") || key.endsWith("_amount");
  }

  function isUrlField(key: string): boolean {
    return key.endsWith("_url") || key.endsWith("_photo_url");
  }

  function isImageUrlField(key: string): boolean {
    return /(_photo_url|_image_url|_logo_url|^logo_url)$/.test(key);
  }

  return (
    <div className="space-y-4">
      {initial.length === 0 && (
        <p className="text-sm text-slate-500">Belum ada setting. Pastikan migration sudah di-apply.</p>
      )}
      {initial.map((s) => {
        const isDirty = values[s.key] !== s.value;
        const isSaving = saving === s.key;
        const isJustSaved = savedKey === s.key;
        const isUploading = uploading === s.key;
        const numeric = isPriceField(s.key);
        const urlField = isUrlField(s.key);
        const imageField = isImageUrlField(s.key);
        const priceValue = numeric ? parseInt(values[s.key] || "0", 10) : 0;
        const currentUrl = values[s.key] ?? "";

        return (
          <div key={s.key} className="border border-slate-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <label className="text-sm font-semibold text-slate-900">{s.key}</label>
              {s.isPublic && (
                <span className="text-[10px] rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 font-semibold">
                  Public
                </span>
              )}
            </div>
            {s.description && (
              <p className="text-xs text-slate-500 mb-2">{s.description}</p>
            )}

            {/* Image preview untuk image URL fields */}
            {imageField && currentUrl && currentUrl.startsWith("http") && (
              <div className="mb-2 inline-block">
                <img
                  src={currentUrl}
                  alt={s.key}
                  className="max-h-32 rounded border border-slate-200"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type={numeric ? "number" : urlField ? "url" : "text"}
                className="input flex-1"
                value={values[s.key] ?? ""}
                onChange={(e) => update(s.key, e.target.value)}
                placeholder={s.value || (urlField ? "https://..." : "")}
              />
              {imageField && (
                <>
                  <button
                    type="button"
                    onClick={() => fileRefs.current[s.key]?.click()}
                    disabled={isUploading}
                    className="btn-secondary !px-3 !py-2 text-xs whitespace-nowrap"
                  >
                    {isUploading ? "Upload..." : "📸 Upload"}
                  </button>
                  <input
                    ref={(el) => { fileRefs.current[s.key] = el; }}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(s.key, f);
                    }}
                  />
                </>
              )}
              <button
                type="button"
                disabled={!isDirty || isSaving}
                onClick={() => save(s.key)}
                className="btn-primary !px-4 !py-2 text-sm whitespace-nowrap"
              >
                {isSaving ? "Menyimpan..." : isJustSaved ? "✓ Tersimpan" : "Simpan"}
              </button>
            </div>
            {numeric && Number.isFinite(priceValue) && priceValue > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                = <strong>{idr(priceValue)}</strong>
              </p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Update terakhir: {new Date(s.updatedAt).toLocaleString("id-ID")}
              {s.updatedBy && ` oleh ${s.updatedBy}`}
            </p>
          </div>
        );
      })}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
