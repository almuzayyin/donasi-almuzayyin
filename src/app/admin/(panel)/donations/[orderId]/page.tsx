import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { donationStore } from "@lib/storage";
import SyncButton from "./SyncButton";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function DonationDetailPage({ params }: Props) {
  await requireAdmin();
  const { orderId } = await params;
  const donation = await donationStore.findById(orderId);
  if (!donation) notFound();

  const fields: [string, string][] = [
    ["Order ID", donation.orderId],
    ["ID", donation.id],
    ["Status", donation.status],
    ["Jenis", donation.type === "mushaf" ? "Wakaf Mushaf" : "Donasi Uang"],
    ["Nominal", idr(donation.amount)],
    ...(donation.type === "mushaf" ? [
      ["Jumlah Mushaf", `${(donation as any).quantity} eksemplar`],
      ["Harga Satuan", idr((donation as any).unitPrice ?? 0)],
    ] as [string, string][] : []),
    ["Donatur", donation.donor.anonymous ? "Hamba Allah" : donation.donor.name],
    ["Email", donation.donor.email],
    ["Telepon", donation.donor.phone ?? "-"],
    ["Pesan", donation.message ?? "-"],
    ["Metode Pembayaran", donation.paymentMethod ?? "-"],
    ["Sumber", donation.isManual ? "Input Manual (Admin)" : "Midtrans"],
    ["Dibuat", new Date(donation.createdAt).toLocaleString("id-ID")],
    ["Update Terakhir", new Date(donation.updatedAt).toLocaleString("id-ID")],
    ["Dibayar Pada", donation.paidAt ? new Date(donation.paidAt).toLocaleString("id-ID") : "-"],
    ...(donation.notes ? [["Catatan Internal", donation.notes]] as [string, string][] : []),
  ];

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <Link href="/admin/donations" className="text-sm text-slate-600 hover:text-primary">
          ← Kembali ke Daftar Donasi
        </Link>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-3xl font-bold font-mono break-all">{donation.orderId}</h1>
          {!donation.isManual && <SyncButton orderId={donation.orderId} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="font-bold text-lg mb-4">Detail Donasi</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
            {fields.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-500 uppercase tracking-wider">{k}</dt>
                <dd className="mt-0.5 break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="card">
            <h2 className="font-bold text-lg mb-4">Aksi</h2>
            {donation.paymentUrl && !donation.isManual && (
              <a
                href={donation.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary w-full mb-2 text-center"
              >
                🔗 Buka Halaman Pembayaran
              </a>
            )}
            {donation.isManual ? (
              <p className="text-xs text-slate-500">
                Donasi ini di-input manual oleh admin (di luar Midtrans). Status sudah lunas.
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Klik <strong>Sync Status</strong> untuk re-check ke Midtrans bila webhook miss.
              </p>
            )}
          </div>

          {donation.proofUrl && (
            <div className="card">
              <h2 className="font-bold text-lg mb-3">Bukti Transfer</h2>
              <a href={donation.proofUrl} target="_blank" rel="noreferrer">
                <img src={donation.proofUrl} alt="Bukti" className="w-full rounded-lg border border-slate-200 hover:opacity-90 transition" />
              </a>
              <p className="mt-2 text-xs text-slate-500">Klik untuk buka full size.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
