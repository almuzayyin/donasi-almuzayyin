import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl bg-primary text-white text-lg sm:text-xl shadow-sm group-hover:bg-primary-dark transition">
              ﷽
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-primary text-sm sm:text-base truncate">Al Muzayyin</span>
              <span className="block text-[10px] sm:text-[11px] text-slate-500 -mt-0.5 truncate">Yayasan Islam Gadung</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/#program" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Program
            </Link>
            <Link href="/transparansi" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Transparansi
            </Link>
            <Link href="/#tentang" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Tentang
            </Link>
            <Link href="/donasi" className="btn-primary !px-3 sm:!px-5 !py-2 sm:!py-2.5">
              Donasi
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-8 sm:py-10 mt-12 sm:mt-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-sm">
          <div>
            <p className="font-bold text-primary">Yayasan Islam Al Muzayyin</p>
            <p className="mt-1 text-slate-600">Gadung, Indonesia</p>
            <p className="mt-2 text-slate-500 text-xs">
              Sedekah jariyah, amal yang tak terputus.
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2">Program</p>
            <ul className="space-y-1 text-slate-600">
              <li><Link href="/donasi?campaign=waqof-al-quran" className="hover:text-primary">Waqof Al-Qur&apos;an</Link></li>
              <li><Link href="/donasi?campaign=santunan-yatim-piatu" className="hover:text-primary">Santunan Yatim Piatu</Link></li>
              <li><Link href="/donasi?campaign=donasi-pembangunan" className="hover:text-primary">Donasi Pembangunan</Link></li>
              <li><Link href="/donasi?campaign=waqof-tanah" className="hover:text-primary">Waqof Tanah</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2">Akuntabilitas</p>
            <p className="text-slate-600 mb-2">
              <Link href="/transparansi" className="text-primary hover:underline font-medium">
                Lihat Laporan Penyaluran →
              </Link>
            </p>
            <p className="text-slate-600 text-xs">Transaksi diproses oleh Midtrans dengan enkripsi end-to-end. Mendukung VA, e-wallet, kartu kredit, dan QRIS.</p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Yayasan Islam Al Muzayyin Gadung. Seluruh donasi tersalur dengan transparan.
        </div>
      </footer>
    </div>
  );
}
