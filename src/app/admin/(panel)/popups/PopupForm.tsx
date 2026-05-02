"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignOption {
  id: string;
  title: string;
  type: "uang" | "mushaf";
}

interface FormData {
  id?: string;
  donorName: string;
  donorLocation: string;
  amount: number | "";
  campaignId: string;
  type: "uang" | "mushaf";
  customMessage: string;
  displayAt: string;
  showUntil: string;
  active: boolean;
}

interface Props {
  initial?: Partial<FormData> & { id?: string };
  campaigns: CampaignOption[];
  mode: "create" | "edit";
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export default function PopupForm({ initial, campaigns, mode }: Props) {
  const router = useRouter();
  const nowLocal = toLocalInput(new Date().toISOString());

  const [data, setData] = useState<FormData>({
    id: initial?.id,
    donorName: initial?.donorName ?? "",
    donorLocation: initial?.donorLocation ?? "",
    amount: initial?.amount ?? "",
    campaignId: initial?.campaignId ?? "",
    type: initial?.type ?? "uang",
    customMessage: initial?.customMessage ?? "",
    displayAt: toLocalInput(initial?.displayAt) || nowLocal,
    showUntil: toLocalInput(initial?.showUntil),
    active: initial?.active ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        donorName: data.donorName.trim(),
        donorLocation: data.donorLocation.trim() || undefined,
        amount: data.amount === "" ? undefined : Number(data.amount),
        campaignId: data.campaignId || undefined,
        type: data.type,
        customMessage: data.customMessage.trim() || undefined,
        displayAt: new Date(data.displayAt).toISOString(),
        showUntil: data.showUntil ? new Date(data.showUntil).toISOString() : undefined,
        active: data.active,
      };
      const url = mode === "create" ? "/api/admin/popups" : `/api/admin/popups/${data.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      router.push("/admin/popups");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (!confirm(`Hapus popup "${data.donorName}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/popups/${data.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal hapus");
      }
      router.push("/admin/popups");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
      setSubmitting(false);
    }
  }

  // Preview text
  const previewName = data.donorLocation
    ? `${data.donorName || "Hamba Allah"} dari ${data.donorLocation}`
    : data.donorName || "Hamba Allah";
  const previewMessage = data.customMessage || "baru saja donasi";

  return (
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Konten Popup</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nama Donatur *</label>
            <input required className="input" value={data.donorName}
              onChange={(e) => update("donorName", e.target.value)}
              placeholder="Hamba Allah / Bapak Ahmad / Ibu Siti" />
          </div>
          <div>
            <label className="label">Lokasi (opsional)</label>
            <input className="input" value={data.donorLocation}
              onChange={(e) => update("donorLocation", e.target.value)}
              placeholder="Jakarta / Surabaya / Bandung" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Jenis</label>
            <select className="input" value={data.type}
              onChange={(e) => update("type", e.target.value as "uang" | "mushaf")}>
              <option value="uang">Donasi Uang</option>
              <option value="mushaf">Wakaf Mushaf</option>
            </select>
          </div>
          <div>
            <label className="label">Nominal (IDR)</label>
            <input type="number" min={0} className="input" value={data.amount}
              onChange={(e) => update("amount", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100000" />
          </div>
        </div>
        <div>
          <label className="label">Program (opsional)</label>
          <select className="input" value={data.campaignId}
            onChange={(e) => update("campaignId", e.target.value)}>
            <option value="">— Tidak terkait program —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pesan Kustom (opsional)</label>
          <input className="input" maxLength={120} value={data.customMessage}
            onChange={(e) => update("customMessage", e.target.value)}
            placeholder="Default: 'baru saja donasi'" />
          <p className="mt-1 text-xs text-slate-500">
            Override teks default. Contoh: &ldquo;berkomitmen wakaf rutin&rdquo;
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Penjadwalan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tampil Mulai *</label>
            <input required type="datetime-local" className="input" value={data.displayAt}
              onChange={(e) => update("displayAt", e.target.value)} />
          </div>
          <div>
            <label className="label">Tampil Sampai (opsional)</label>
            <input type="datetime-local" className="input" value={data.showUntil}
              onChange={(e) => update("showUntil", e.target.value)} />
            <p className="mt-1 text-xs text-slate-500">Kosongkan untuk tidak ada batas waktu</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
            checked={data.active}
            onChange={(e) => update("active", e.target.checked)} />
          <span className="text-sm">Aktif (tampil di landing)</span>
        </label>
      </div>

      {/* Preview */}
      <div className="card bg-slate-50 border-slate-200">
        <p className="text-xs text-slate-600 mb-3">Preview popup:</p>
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 sm:p-4 flex items-start gap-3 max-w-sm">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xl">
            {data.type === "mushaf" ? "📖" : "💚"}
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-slate-900 truncate">
              {previewName} <span className="font-normal text-slate-500">{previewMessage}</span>
            </p>
            {data.amount && data.amount > 0 && (
              <p className="font-bold text-primary mt-0.5">{idr(Number(data.amount))}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">baru saja</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Menyimpan..." : mode === "create" ? "Buat Popup" : "Simpan"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Batal
          </button>
        </div>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} disabled={submitting}
            className="text-sm text-red-600 hover:text-red-700">
            Hapus
          </button>
        )}
      </div>
    </form>
  );
}
