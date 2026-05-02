"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignOption {
  id: string;
  title: string;
  type: "uang" | "mushaf";
}

interface Props {
  campaigns: CampaignOption[];
  mushafUnitPrice: number;
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ManualDonationForm({ campaigns, mushafUnitPrice }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [campaignId, setCampaignId] = useState("");
  const [type, setType] = useState<"uang" | "mushaf">("uang");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [amount, setAmount] = useState<number>(100_000);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");
  const [paidAt, setPaidAt] = useState(today);
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = type === "mushaf" ? quantity * mushafUnitPrice : amount;

  async function uploadProof(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-report", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload gagal");
      setProofUrl(json.publicUrl);
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
      const payload = {
        type,
        campaignId: campaignId || undefined,
        donor: {
          name: donorName,
          email: donorEmail,
          phone: donorPhone || undefined,
          anonymous,
        },
        amount: type === "uang" ? amount : undefined,
        quantity: type === "mushaf" ? quantity : undefined,
        paymentMethod,
        paidAt: new Date(paidAt).toISOString(),
        notes: notes || undefined,
        proofUrl: proofUrl || undefined,
      };
      const res = await fetch("/api/admin/donations/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      router.push(`/admin/donations/${json.donation.orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Detail Donasi</h2>
        <div>
          <label className="label">Program (opsional)</label>
          <select className="input" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            <option value="">— Donasi umum —</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jenis Donasi *</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setType("uang")}
              className={`rounded-lg border-2 p-3 text-sm font-semibold ${
                type === "uang" ? "border-primary bg-primary/5" : "border-slate-200"
              }`}>
              💰 Donasi Uang
            </button>
            <button type="button" onClick={() => setType("mushaf")}
              className={`rounded-lg border-2 p-3 text-sm font-semibold ${
                type === "mushaf" ? "border-primary bg-primary/5" : "border-slate-200"
              }`}>
              📖 Wakaf Mushaf
            </button>
          </div>
        </div>
        {type === "uang" ? (
          <div>
            <label className="label">Nominal *</label>
            <input required type="number" min={1000} step={1000} className="input"
              value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
        ) : (
          <div>
            <label className="label">Jumlah Mushaf *</label>
            <input required type="number" min={1} className="input"
              value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <p className="mt-1 text-xs text-slate-500">
              {quantity} × {idr(mushafUnitPrice)} = <strong>{idr(quantity * mushafUnitPrice)}</strong>
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Tanggal Pembayaran *</label>
            <input required type="date" className="input" value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div>
            <label className="label">Metode Pembayaran</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option>Transfer Bank</option>
              <option>Tunai</option>
              <option>QRIS</option>
              <option>E-Wallet</option>
              <option>Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Data Donatur</h2>
        <div>
          <label className="label">Nama *</label>
          <input required className="input" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email *</label>
            <input required type="email" className="input" value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Telepon</label>
            <input className="input" value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
            checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          Tampilkan sebagai &ldquo;Hamba Allah&rdquo; di publik
        </label>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-3">Bukti Transfer (opsional)</h2>
        {proofUrl && (
          <img src={proofUrl} alt="Bukti" className="mb-3 max-h-48 rounded-lg border border-slate-200" />
        )}
        <input type="file" accept="image/*,application/pdf"
          onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])}
          className="block w-full text-sm" />
        {uploading && <p className="mt-2 text-xs text-slate-500">Mengupload...</p>}
        <p className="mt-2 text-xs text-slate-500">
          Upload screenshot / foto bukti transfer dari donatur. Max 10MB.
        </p>
      </div>

      <div className="card">
        <label className="label">Catatan (opsional)</label>
        <textarea rows={3} className="input" value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan internal: nomor referensi transfer, info tambahan, dll" />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Menyimpan..." : `Simpan Donasi ${idr(finalAmount)}`}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  );
}
