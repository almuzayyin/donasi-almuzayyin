"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

interface CampaignOption {
  id: string;
  slug: string;
  title: string;
  type: "uang" | "mushaf";
}

interface Props {
  campaigns: CampaignOption[];
  initialType: "uang" | "mushaf";
  initialCampaign: string;
  mushafUnitPrice: number;
  midtransClientKey: string;
  midtransIsProduction: boolean;
}

const PRESETS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

declare global {
  interface Window {
    snap?: {
      pay(token: string, options?: {
        onSuccess?: (r: unknown) => void;
        onPending?: (r: unknown) => void;
        onError?: (r: unknown) => void;
        onClose?: () => void;
      }): void;
    };
  }
}

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function DonationForm(props: Props) {
  const router = useRouter();
  const [type, setType] = useState<"uang" | "mushaf">(props.initialType);
  const [campaign, setCampaign] = useState(props.initialCampaign);
  const [amount, setAmount] = useState<number>(100_000);
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCampaigns = useMemo(
    () => props.campaigns.filter((c) => c.type === type),
    [props.campaigns, type]
  );

  useEffect(() => {
    if (campaign && !filteredCampaigns.find((c) => c.slug === campaign)) {
      setCampaign("");
    }
  }, [type, campaign, filteredCampaigns]);

  const totalMushaf = quantity * props.mushafUnitPrice;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type,
        campaignSlug: campaign || undefined,
        donor: { name, email, phone: phone || undefined, anonymous },
        message: message || undefined,
        ...(type === "uang"
          ? { amount }
          : { quantity }),
      };

      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membuat donasi");

      const token: string = data.paymentToken;
      const orderId: string = data.donation.orderId;

      if (window.snap && token) {
        window.snap.pay(token, {
          onSuccess: () => router.push(`/sukses?order_id=${orderId}`),
          onPending: () => router.push(`/sukses?order_id=${orderId}&pending=1`),
          onError: () => router.push(`/gagal?order_id=${orderId}`),
          onClose: () => setSubmitting(false),
        });
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  const snapSrc = props.midtransIsProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <>
      <Script
        src={snapSrc}
        data-client-key={props.midtransClientKey}
        strategy="afterInteractive"
      />

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Toggle Type */}
        <div className="card">
          <label className="label">Jenis Donasi</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("uang")}
              className={`rounded-xl border-2 p-4 text-left transition ${
                type === "uang"
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-2xl">💰</div>
              <div className="mt-2 font-semibold">Donasi Uang</div>
              <div className="text-xs text-slate-500">Sedekah / infaq nominal bebas</div>
            </button>
            <button
              type="button"
              onClick={() => setType("mushaf")}
              className={`rounded-xl border-2 p-4 text-left transition ${
                type === "mushaf"
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-2xl">📖</div>
              <div className="mt-2 font-semibold">Wakaf Mushaf</div>
              <div className="text-xs text-slate-500">{idr(props.mushafUnitPrice)} per eksemplar</div>
            </button>
          </div>
        </div>

        {/* Amount / Quantity */}
        <div className="card">
          {type === "uang" ? (
            <>
              <label className="label">Nominal Donasi</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      amount === p
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200 hover:border-primary"
                    }`}
                  >
                    {idr(p)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1000}
                step={1000}
                className="input"
                placeholder="Atau masukkan nominal lain"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <p className="mt-2 text-xs text-slate-500">Minimal Rp 1.000</p>
            </>
          ) : (
            <>
              <label className="label">Jumlah Mushaf</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  className="input text-center w-24"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-lg"
                >
                  +
                </button>
                <span className="ml-2 text-sm text-slate-500">eksemplar</span>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span>{quantity} × {idr(props.mushafUnitPrice)}</span>
                  <span className="font-semibold">{idr(totalMushaf)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Campaign */}
        {filteredCampaigns.length > 0 && (
          <div className="card">
            <label className="label">Program (opsional)</label>
            <select
              className="input"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            >
              <option value="">— Donasi umum —</option>
              {filteredCampaigns.map((c) => (
                <option key={c.id} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Donor Info */}
        <div className="card space-y-4">
          <div>
            <label className="label">Nama Lengkap</label>
            <input
              required
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Anda"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                required
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="label">Nomor HP (opsional)</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>
          <div>
            <label className="label">Pesan / Doa (opsional)</label>
            <textarea
              rows={3}
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sertakan pesan atau doa Anda"
              maxLength={500}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Sembunyikan nama saya (Hamba Allah)
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-lg py-4"
        >
          {submitting ? "Memproses..." : `Donasi ${idr(type === "uang" ? amount : totalMushaf)}`}
        </button>

        <p className="text-center text-xs text-slate-500">
          Pembayaran diproses secara aman oleh Midtrans
        </p>
      </form>
    </>
  );
}
