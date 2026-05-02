import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { reportStore, campaignStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default async function ReportsPage() {
  await requireAdmin();
  const [reports, campaigns] = await Promise.all([
    reportStore.list(),
    campaignStore.list(),
  ]);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.title]));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Penyaluran</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Bukti dan rincian penggunaan dana donasi.
          </p>
        </div>
        <Link href="/admin/reports/new" className="btn-primary w-full sm:w-auto">
          + Buat Laporan
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          Belum ada laporan. Klik &ldquo;Buat Laporan&rdquo; untuk dokumentasi penyaluran pertama.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {reports.map((r) => {
            const photo = r.photos[0]?.url;
            return (
              <Link key={r.id} href={`/admin/reports/${r.id}`}
                className="card hover:border-primary transition flex flex-col">
                {photo && (
                  <img src={photo} alt="" className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 h-40 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] object-cover" />
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs text-primary font-semibold">
                    {r.campaignId ? campaignMap.get(r.campaignId) ?? "—" : "—"}
                  </span>
                  {!r.published && <span className="badge bg-slate-100 text-slate-600">Draft</span>}
                </div>
                <h3 className="font-bold leading-snug">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(r.reportDate).toLocaleDateString("id-ID", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                  {r.location && ` · ${r.location}`}
                </p>
                {r.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{r.description}</p>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{r.photos.length} foto</span>
                  {r.amountUsed && <span className="font-semibold text-slate-900">{idr(r.amountUsed)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
