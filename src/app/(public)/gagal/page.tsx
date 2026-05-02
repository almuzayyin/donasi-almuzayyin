import Link from "next/link";

export default function GagalPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-6 py-10 sm:py-16">
      <div className="card text-center">
        <div className="mx-auto grid h-16 sm:h-20 w-16 sm:w-20 place-items-center rounded-full bg-red-100 text-red-600 text-3xl sm:text-4xl mb-4">
          ✕
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">Pembayaran Gagal</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Maaf, transaksi Anda tidak berhasil diproses. Silakan coba lagi atau pilih metode pembayaran lain.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link href="/" className="btn-secondary">Kembali ke Beranda</Link>
          <Link href="/donasi" className="btn-primary">Coba Lagi</Link>
        </div>
      </div>
    </div>
  );
}
