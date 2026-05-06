import Link from "next/link";
import DonationFeedPopup from "./DonationFeedPopup";
import Logo from "@/components/Logo";
import MobileMenu from "@/components/MobileMenu";
import PaymentMethods from "@/components/PaymentMethods";

// Public pages fetch dari DB (campaigns, reports, pages) — render dinamis tiap request.
// Ini juga mencegah build gagal kalau env Supabase belum di-set.
export const dynamic = "force-dynamic";

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
            <Logo size={44} className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 transition group-hover:scale-105" />
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-primary text-sm sm:text-base truncate">Al Muzayyin</span>
              <span className="block text-[10px] sm:text-[11px] text-slate-500 -mt-0.5 truncate">Yayasan Islam Gadung</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/#program" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Program
            </Link>
            <Link href="/galeri" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Galeri
            </Link>
            <Link href="/transparansi" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Transparansi
            </Link>
            <Link href="/legalitas" className="hidden lg:inline text-sm text-slate-600 hover:text-primary">
              Legalitas
            </Link>
            <Link href="/tentang" className="hidden md:inline text-sm text-slate-600 hover:text-primary">
              Tentang
            </Link>
            <Link href="/donasi" className="btn-primary !px-3 sm:!px-5 !py-2 sm:!py-2.5">
              Donasi
            </Link>
            {/* Hamburger drawer — auto-hide di desktop (md:hidden internal) */}
            <MobileMenu />
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <DonationFeedPopup />
      <footer className="border-t border-slate-200 bg-white py-8 sm:py-10 mt-12 sm:mt-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Logo size={36} className="h-9 w-9" />
              <p className="font-bold text-primary leading-tight">
                Yayasan Islam<br/>Al Muzayyin
              </p>
            </div>
            <p className="mt-1 text-slate-600 text-xs">Gadung, Driyorejo, Gresik</p>
            <p className="mt-2 text-primary text-xs italic font-medium">
              Mencetak Generasi Qur&apos;ani
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
              <li><Link href="/galeri" className="hover:text-primary">Galeri Kegiatan</Link></li>
              <li><Link href="/kontak" className="hover:text-primary">Kontak</Link></li>
              <li><Link href="/legalitas" className="hover:text-primary">Legalitas</Link></li>
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

        {/* Trust Section: Rekening + Badan Hukum */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-6 sm:mt-8 pt-6 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Rekening */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                <span aria-hidden="true">🏦</span> Rekening Resmi Yayasan
              </p>
              <div className="text-sm leading-relaxed">
                <p className="font-bold text-slate-900">Bank Mandiri</p>
                <p className="text-xs text-slate-500 mb-1.5">KCP Surabaya Pakuwon City</p>
                <p className="font-mono text-base font-semibold text-primary tracking-wider mb-1">
                  140-00-3993992-2
                </p>
                <p className="text-xs text-slate-600">
                  a.n. Yayasan Islam Al Muzayyin Gadung
                </p>
              </div>
            </div>

            {/* Badan Hukum */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
              <p className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                <span aria-hidden="true">⚖️</span> Berbadan Hukum Resmi
              </p>
              <div className="text-sm leading-relaxed">
                <p className="text-xs text-slate-600 mb-1.5">
                  Disahkan oleh Kementerian Hukum dan HAM RI
                </p>
                <p className="text-xs">
                  <span className="text-slate-500">SK Menkumham:</span>{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    AHU-0017282.AH.01.04.Tahun 2023
                  </span>
                </p>
                <Link
                  href="/legalitas"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Lihat dokumen legal lengkap
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-8 pt-6 border-t border-slate-100">
          <PaymentMethods />
        </div>

        <div className="mx-auto max-w-6xl px-5 sm:px-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Yayasan Islam Al Muzayyin Gadung. Seluruh donasi tersalur dengan transparan.
        </div>
      </footer>
    </div>
  );
}
