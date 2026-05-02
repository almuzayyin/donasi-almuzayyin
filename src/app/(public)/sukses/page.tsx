import Link from "next/link";
import { donationStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  searchParams: Promise<{ order_id?: string; pending?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.order_id;
  const isPending = params.pending === "1";
  const donation = orderId ? await donationStore.findById(orderId) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-6 py-10 sm:py-16">
      <div className="card text-center">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
          isPending ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
        } text-4xl mb-4`}>
          {isPending ? "⏳" : "✓"}
        </div>
        <h1 className="text-2xl font-bold">
          {isPending ? "Menunggu Pembayaran" : "Terima Kasih atas Donasi Anda"}
        </h1>
        <p className="mt-2 text-slate-600">
          {isPending
            ? "Selesaikan pembayaran Anda. Kami akan mengirim tanda terima ke email setelah pembayaran berhasil."
            : "Donasi Anda telah kami terima. Tanda terima sudah dikirim ke email Anda."}
        </p>

        {donation && (
          <div className="mt-6 rounded-xl bg-slate-50 p-5 text-left text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-slate-500">Order ID</div>
              <div className="font-mono">{donation.orderId}</div>

              <div className="text-slate-500">Jenis</div>
              <div>{donation.type === "mushaf" ? "Wakaf Mushaf" : "Donasi Uang"}</div>

              {donation.type === "mushaf" && (
                <>
                  <div className="text-slate-500">Jumlah</div>
                  <div>{(donation as any).quantity} eksemplar</div>
                </>
              )}

              <div className="text-slate-500">Total</div>
              <div className="font-semibold">{idr(donation.amount)}</div>

              <div className="text-slate-500">Status</div>
              <div className="capitalize">{donation.status}</div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link href="/" className="btn-secondary">Kembali ke Beranda</Link>
          <Link href="/donasi" className="btn-primary">Donasi Lagi</Link>
        </div>
      </div>
    </div>
  );
}
