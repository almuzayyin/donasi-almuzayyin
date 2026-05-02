import Link from "next/link";
import { publicCampaignStore, publicReportStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  searchParams: Promise<{ campaign?: string }>;
}

export default async function TransparansiPage({ searchParams }: Props) {
  const params = await searchParams;
  const filterSlug = params.campaign;

  const campaigns = await publicCampaignStore.listActive();
  const filterCampaign = filterSlug ? campaigns.find((c) => c.slug === filterSlug) : undefined;

  const reports = await publicReportStore.listPublished({
    campaignId: filterCampaign?.id,
    limit: 60,
  });
  const campaignMap = new Map(campaigns.map((c) => [c.id, c]));

  // Aggregate stats per campaign
  const aggregates = new Map<string, number>();
  for (const r of reports) {
    if (r.campaignId && r.amountUsed) {
      aggregates.set(r.campaignId, (aggregates.get(r.campaignId) ?? 0) + r.amountUsed);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">Transparansi</p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">Laporan Penyaluran Donasi</h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Setiap rupiah amanah Anda kami pertanggungjawabkan. Berikut bukti dan rincian
          penggunaan dana donasi Yayasan Islam Al Muzayyin.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 justify-center">
        <Link
          href="/transparansi"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !filterSlug ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-primary"
          }`}
        >
          Semua Program
        </Link>
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/transparansi?campaign=${c.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterSlug === c.slug
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:border-primary"
            }`}
          >
            {c.title}
          </Link>
        ))}
      </div>

      {/* Stats per campaign (when no filter) */}
      {!filterSlug && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {campaigns.map((c) => {
            const distributed = aggregates.get(c.id) ?? 0;
            const distributedPct = c.collectedAmount > 0
              ? Math.min(100, (distributed / c.collectedAmount) * 100)
              : 0;
            return (
              <div key={c.id} className="card !p-4">
                <p className="text-xs text-slate-500 truncate">{c.title}</p>
                <p className="mt-1 text-base sm:text-lg font-bold text-primary">{idr(distributed)}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  dari {idr(c.collectedAmount)} terkumpul
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${distributedPct}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{distributedPct.toFixed(0)}% tersalurkan</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Reports list */}
      {reports.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          {filterSlug
            ? "Belum ada laporan untuk program ini."
            : "Belum ada laporan penyaluran. Cek kembali nanti."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {reports.map((r) => {
            const campaign = r.campaignId ? campaignMap.get(r.campaignId) : undefined;
            const photo = r.photos[0]?.url;
            return (
              <Link key={r.id} href={`/transparansi/${r.id}`}
                className="card !p-0 overflow-hidden hover:border-primary transition flex flex-col">
                {photo ? (
                  <div className="aspect-[16/10] bg-slate-100">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary to-primary-dark grid place-items-center text-white text-5xl">
                    📋
                  </div>
                )}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {campaign && (
                    <span className="text-xs text-primary font-semibold mb-1">{campaign.title}</span>
                  )}
                  <h3 className="font-bold leading-snug">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(r.reportDate).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                  {r.location && (
                    <p className="text-xs text-slate-500 mt-0.5">📍 {r.location}</p>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{r.photos.length} foto</span>
                    {r.amountUsed && <span className="font-bold text-primary">{idr(r.amountUsed)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
