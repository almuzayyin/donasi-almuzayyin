"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignOption {
  id: string;
  title: string;
  type: "uang" | "mushaf";
}

interface PhotoItem {
  url: string;
  caption: string;
}

interface ExpenseLine {
  category: string;
  description: string;
  amount: number;
}

interface FormData {
  id?: string;
  campaignId: string;
  title: string;
  description: string;
  amountUsed: number | "";
  quantity: number | "";
  reportDate: string; // YYYY-MM-DD
  location: string;
  recipient: string;
  photos: PhotoItem[];
  expenses: ExpenseLine[];
  published: boolean;
}

interface Props {
  initial?: Partial<FormData> & { id?: string };
  campaigns: CampaignOption[];
  mode: "create" | "edit";
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ReportForm({ initial, campaigns, mode }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<FormData>({
    id: initial?.id,
    campaignId: initial?.campaignId ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    amountUsed: initial?.amountUsed ?? "",
    quantity: initial?.quantity ?? "",
    reportDate: initial?.reportDate?.slice(0, 10) ?? today,
    location: initial?.location ?? "",
    recipient: initial?.recipient ?? "",
    photos: initial?.photos ?? [],
    expenses: initial?.expenses ?? [],
    published: initial?.published ?? true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const expenseTotal = data.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const selectedCampaign = campaigns.find((c) => c.id === data.campaignId);
  const isMushaf = selectedCampaign?.type === "mushaf";

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-report", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal");
      update("photos", [...data.photos, { url: json.publicUrl, caption: "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(idx: number) {
    update("photos", data.photos.filter((_, i) => i !== idx));
  }

  function updatePhotoCaption(idx: number, caption: string) {
    update("photos", data.photos.map((p, i) => i === idx ? { ...p, caption } : p));
  }

  function addExpense() {
    update("expenses", [...data.expenses, { category: "", description: "", amount: 0 }]);
  }

  function removeExpense(idx: number) {
    update("expenses", data.expenses.filter((_, i) => i !== idx));
  }

  function updateExpense(idx: number, key: keyof ExpenseLine, value: string | number) {
    update("expenses", data.expenses.map((e, i) =>
      i === idx ? { ...e, [key]: value } : e
    ));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        campaignId: data.campaignId || undefined,
        title: data.title,
        description: data.description || undefined,
        amountUsed: data.amountUsed === "" ? undefined : Number(data.amountUsed),
        quantity: data.quantity === "" ? undefined : Number(data.quantity),
        reportDate: new Date(data.reportDate).toISOString(),
        location: data.location || undefined,
        recipient: data.recipient || undefined,
        photos: data.photos.filter(p => p.url),
        published: data.published,
        expenses: data.expenses
          .filter(e => e.category && e.amount > 0)
          .map((e, idx) => ({
            category: e.category,
            description: e.description || undefined,
            amount: Number(e.amount),
            sortOrder: idx,
          })),
      };

      const url = mode === "create"
        ? "/api/admin/reports"
        : `/api/admin/reports/${data.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      router.push("/admin/reports");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (!confirm(`Hapus laporan "${data.title}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/reports/${data.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal hapus");
      }
      router.push("/admin/reports");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      {/* Info Dasar */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Info Laporan</h2>
        <div>
          <label className="label">Program *</label>
          <select required className="input" value={data.campaignId}
            onChange={(e) => update("campaignId", e.target.value)}>
            <option value="">— Pilih program —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Judul Laporan *</label>
          <input required className="input" value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Penyerahan 50 mushaf ke Pesantren Al-Hidayah" />
        </div>
        <div>
          <label className="label">Deskripsi</label>
          <textarea rows={4} className="input" value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Detail kegiatan, jumlah penerima, hasil yang dicapai..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tanggal Kegiatan *</label>
            <input required type="date" className="input" value={data.reportDate}
              onChange={(e) => update("reportDate", e.target.value)} />
          </div>
          <div>
            <label className="label">Nominal Dipakai (IDR)</label>
            <input type="number" min={0} className="input" value={data.amountUsed}
              onChange={(e) => update("amountUsed", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0" />
            {expenseTotal > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Total dari rincian biaya: <strong>{idr(expenseTotal)}</strong>
              </p>
            )}
          </div>
        </div>
        {isMushaf && (
          <div>
            <label className="label">Jumlah Mushaf Disalurkan</label>
            <input type="number" min={0} className="input" value={data.quantity}
              onChange={(e) => update("quantity", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="50" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Lokasi</label>
            <input className="input" value={data.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Pesantren Al-Hidayah, Desa Sumberjaya" />
          </div>
          <div>
            <label className="label">Penerima</label>
            <input className="input" value={data.recipient}
              onChange={(e) => update("recipient", e.target.value)}
              placeholder="Pengurus Pesantren — Ust. Ahmad" />
          </div>
        </div>
      </div>

      {/* Foto */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Foto Kegiatan</h2>
          <span className="text-xs text-slate-500">{data.photos.length} foto</span>
        </div>
        {data.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {data.photos.map((p, i) => (
              <div key={i} className="relative group">
                <img src={p.url} alt="" className="h-32 w-full object-cover rounded-lg" />
                <button type="button" onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white text-xs opacity-90 hover:opacity-100">
                  ✕
                </button>
                <input type="text" placeholder="Caption (opsional)"
                  value={p.caption}
                  onChange={(e) => updatePhotoCaption(i, e.target.value)}
                  className="mt-1.5 w-full text-xs px-2 py-1 border border-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*"
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
          className="block w-full text-sm" />
        {uploading && <p className="mt-2 text-xs text-slate-500">Mengupload...</p>}
        <p className="mt-2 text-xs text-slate-500">
          Max 10MB per foto. PNG/JPG/WEBP. Upload satu per satu.
        </p>
      </div>

      {/* Rincian Biaya (Phase 2) */}
      <div className="card">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold text-lg">Rincian Biaya (opsional)</h2>
          <button type="button" onClick={addExpense} className="btn-secondary !py-1.5 !px-3 text-xs">
            + Tambah Pos
          </button>
        </div>
        {data.expenses.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada rincian. Klik &ldquo;Tambah Pos&rdquo; untuk breakdown biaya per kategori
            (mis. Pembelian, Pengiriman, Konsumsi).
          </p>
        ) : (
          <div className="space-y-2">
            {data.expenses.map((e, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <input className="input col-span-12 sm:col-span-4" placeholder="Kategori"
                  value={e.category}
                  onChange={(ev) => updateExpense(i, "category", ev.target.value)} />
                <input className="input col-span-12 sm:col-span-5" placeholder="Catatan (opsional)"
                  value={e.description}
                  onChange={(ev) => updateExpense(i, "description", ev.target.value)} />
                <input className="input col-span-9 sm:col-span-2" type="number" min={0}
                  placeholder="Nominal"
                  value={e.amount || ""}
                  onChange={(ev) => updateExpense(i, "amount", Number(ev.target.value))} />
                <button type="button" onClick={() => removeExpense(i)}
                  className="col-span-3 sm:col-span-1 text-red-600 text-sm hover:underline self-center">
                  Hapus
                </button>
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <p className="text-sm">
                <span className="text-slate-500">Total Rincian: </span>
                <strong>{idr(expenseTotal)}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="card">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
            checked={data.published}
            onChange={(e) => update("published", e.target.checked)} />
          <span className="text-sm">Publikasikan ke halaman transparansi publik</span>
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Uncheck untuk simpan sebagai draft (tidak terlihat publik).
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Menyimpan..." : mode === "create" ? "Buat Laporan" : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Batal
          </button>
        </div>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} disabled={submitting}
            className="text-sm text-red-600 hover:text-red-700">
            Hapus laporan
          </button>
        )}
      </div>
    </form>
  );
}
