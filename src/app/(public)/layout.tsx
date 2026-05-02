import Link from "next/link";

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

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
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
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
            <p className="font-semibold text-slate-700 mb-2">Yayasan</p>
            <ul className="space-y-1 text-slate-600">
              <li><Link href="/tentang" className="hover:text-primary">Tentang Kami</Link></li>
              <li><Link href="/kontak" className="hover:text-primary">Kontak</Link></li>
              <li><Link href="/transparansi" className="hover:text-primary">Transparansi</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2">Legal</p>
            <ul className="space-y-1 text-slate-600">
              <li><Link href="/kebijakan-privasi" className="hover:text-primary">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="hover:text-primary">Syarat &amp; Ketentuan</Link></li>
              <li><Link href="/pengembalian-dana" className="hover:text-primary">Pengembalian Dana</Link></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-3 text-center md:text-left">
            🔒 Pembayaran Aman Diproses oleh
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-md text-xs font-semibold text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Midtrans
            </span>
            <PaymentBadge>Visa</PaymentBadge>
            <PaymentBadge>Mastercard</PaymentBadge>
            <PaymentBadge>JCB</PaymentBadge>
            <PaymentBadge>BCA</PaymentBadge>
            <PaymentBadge>Mandiri</PaymentBadge>
            <PaymentBadge>BNI</PaymentBadge>
            <PaymentBadge>BRI</PaymentBadge>
            <PaymentBadge>GoPay</PaymentBadge>
            <PaymentBadge>OVO</PaymentBadge>
            <PaymentBadge>DANA</PaymentBadge>
            <PaymentBadge>ShopeePay</PaymentBadge>
            <PaymentBadge>QRIS</PaymentBadge>
          </div>
          <p className="mt-3 text-xs text-slate-500 text-center md:text-left">
            Semua transaksi dienkripsi end-to-end. Data kartu kredit tidak pernah disimpan di server kami.
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Yayasan Islam Al Muzayyin Gadung. Seluruh donasi tersalur dengan transparan.
        </div>
      </footer>
    </div>
  );
}
