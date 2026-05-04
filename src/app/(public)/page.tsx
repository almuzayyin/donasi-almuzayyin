import Link from "next/link";
import { publicCampaignStore, publicGalleryStore, publicReportStore, publicSettingsStore } from "@lib/storage";
import type { Campaign, Gallery } from "@lib/types";
import Logo from "@/components/Logo";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const programIcons: Record<string, string> = {
  "waqof-al-quran": "📖",
  "santunan-yatim-piatu": "🤲",
  "donasi-pembangunan": "🕌",
  "waqof-tanah": "🌱",
};

export default async function HomePage() {
  let campaigns: Campaign[] = [];
  let distributedMap = new Map<string, number>();
  let recentGallery: Gallery[] = [];
  let tagline = "Mencetak Generasi Qur'ani";
  try {
    const [c, g, t] = await Promise.all([
      publicCampaignStore.listActive(),
      publicGalleryStore.listPublished({ isDocument: false, limit: 8 }),
      publicSettingsStore.get("tagline"),
    ]);
    campaigns = c;
    recentGallery = g;
    if (t) tagline = t;
    const distributedResults = await Promise.all(
      campaigns.map((c) => publicReportStore.sumDistributedByCampaign(c.id))
    );
    campaigns.forEach((c, i) => distributedMap.set(c.id, distributedResults[i]));
  } catch (err) {
    console.error("[landing] gagal load campaigns/galeri:", err);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          <div className="text-[12rem] sm:text-[16rem] md:text-[20rem] leading-none absolute -right-12 sm:-right-20 -top-6 sm:-top-10">ﷲ</div>
        </div>
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-20 md:py-28 relative">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
            <div className="max-w-2xl">
              <p className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border border-white/20">
                ✨ Yayasan Islam Al Muzayyin Gadung
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                {tagline}
              </h1>
              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-white/90 leading-relaxed">
                Yayasan berbadan hukum yang menaungi <strong className="text-white">Pondok Pesantren, SMP, dan SMA Tahfidzul Qur&apos;an</strong>.
                Salurkan donasi Anda untuk Wakaf Al-Qur&apos;an, Santunan Yatim Piatu, Donasi Pembangunan,
                dan Wakaf Tanah lewat platform yang aman dan transparan.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/donasi" className="rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow-sm hover:bg-slate-100 text-center">
                  Donasi Sekarang
                </Link>
                <Link href="#program" className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 text-center">
                  Lihat Program
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" aria-hidden="true" />
                <Logo size={240} className="relative h-60 w-60 drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="mx-auto max-w-6xl px-5 sm:px-6 -mt-8 sm:-mt-12 mb-10 sm:mb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">100% Aman</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">Pembayaran terenkripsi via Midtrans</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">Transparan</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">Tanda terima otomatis & laporan publik</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">Banyak Pilihan</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">VA, e-wallet, kartu kredit, QRIS</p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="program" className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">Program Donasi</p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">4 Pintu Kebaikan</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto px-2">
            Pilih program yang sesuai dengan niat Anda. Setiap rupiah amanah Anda kami jaga dan salurkan.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="card text-center text-slate-600">
            Belum ada program aktif. Jalankan{" "}
            <code className="rounded bg-slate-100 px-2 py-0.5 text-sm">npm run db:seed</code>{" "}
            untuk menambahkan data contoh.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {campaigns.map((c) => {
              const pct = c.targetAmount > 0
                ? Math.min(100, (c.collectedAmount / c.targetAmount) * 100)
                : 0;
              const icon = programIcons[c.slug] ?? (c.type === "mushaf" ? "📖" : "🤲");
              return (
                <article key={c.id} className="card flex gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-3xl">
                    {icon}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-1.5 ${
                      c.type === "mushaf" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    }`}>
                      {c.type === "mushaf" ? "Wakaf Mushaf" : "Donasi Uang"}
                    </span>
                    <h3 className="font-bold text-lg leading-snug">{c.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{c.description}</p>
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between text-xs text-slate-600">
                        <span><strong className="text-slate-900">{idr(c.collectedAmount)}</strong> dari {idr(c.targetAmount)}</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      {(distributedMap.get(c.id) ?? 0) > 0 && (
                        <p className="mt-1 text-xs text-primary">
                          ✓ {idr(distributedMap.get(c.id) ?? 0)} sudah tersalurkan
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/donasi?campaign=${c.slug}&type=${c.type}`}
                        className="btn-primary flex-1"
                      >
                        Donasi
                      </Link>
                      <Link
                        href={`/transparansi?campaign=${c.slug}`}
                        className="btn-secondary !py-2 sm:!py-2.5 text-sm sm:flex-1"
                      >
                        Laporan
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Galeri Kegiatan Preview */}
      {recentGallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-12">
          <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">Dokumentasi</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Galeri Kegiatan</h2>
            </div>
            <Link href="/galeri" className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {recentGallery.slice(0, 8).map((g) => (
              <Link
                key={g.id}
                href="/galeri"
                className="aspect-square overflow-hidden rounded-lg bg-slate-100 group relative"
              >
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                  <p className="text-white text-xs font-semibold line-clamp-2">{g.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tentang */}
      <section id="tentang" className="bg-white py-12 sm:py-16 mt-10 sm:mt-12 border-y border-slate-200">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">Tentang Yayasan</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Yayasan Islam Al Muzayyin Gadung</h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-700 leading-relaxed">
            Yayasan Islam Al Muzayyin berkhidmat dalam bidang dakwah, pendidikan, dan
            santunan sosial di Gadung. Kami merawat amanah donasi umat untuk dipakai
            secara tepat sasaran — mulai dari mushaf yang dibagikan ke santri, santunan
            rutin untuk yatim piatu, pembangunan sarana ibadah dan pendidikan, hingga
            wakaf tanah untuk pengembangan jangka panjang.
          </p>
          <blockquote className="mt-6 sm:mt-8 italic text-sm sm:text-base text-slate-600 border-l-4 border-accent pl-4 max-w-xl mx-auto text-left">
            &ldquo;Apabila anak Adam meninggal, terputus seluruh amalnya kecuali tiga: sedekah jariyah,
            ilmu yang bermanfaat, dan anak shalih yang mendoakannya.&rdquo;
            <span className="block mt-2 not-italic text-xs sm:text-sm text-slate-500">— HR. Muslim</span>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
