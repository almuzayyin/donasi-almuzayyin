import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { reportStore, campaignStore } from "@lib/storage";
import Pagination from "../Pagination";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{
    q?: string;
    campaign?: string;
    period?: string;
    status?: string;
    page?: string;
  }>;
}

function periodCutoff(period?: string): number | null {
  if (!period) return null;
  const now = Date.now();
  switch (period) {
    case "7d": return now - 7 * 24 * 60 * 60 * 1000;
    case "30d": return now - 30 * 24 * 60 * 60 * 1000;
    case "90d": return now - 90 * 24 * 60 * 60 * 1000;
    case "1y": return now - 365 * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

export default async function ReportsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const [allReports, campaigns] = await Promise.all([
    reportStore.list(),
    campaignStore.list(),
  ]);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.title]));

  let reports = allReports;
  if (params.q) {
    const q = params.q.toLowerCase();
    reports = reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.location ?? "").toLowerCase().includes(q) ||
        (r.recipient ?? "").toLowerCase().includes(q)
    );
  }
  if (params.campaign) reports = reports.filter((r) => r.campaignId === params.campaign);
  if (params.status === "published") reports = reports.filter((r) => r.published);
  if (params.status === "draft") reports = reports.filter((r) => !r.published);

  const cutoff = periodCutoff(params.period);
  if (cutoff !== null) {
    reports = reports.filter((r) => new Date(r.reportDate).getTime() >= cutoff);
  }

  const total = reports.length;
  const totalAmount = reports.reduce((s, r) => s + (r.amountUsed ?? 0), 0);
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  reports = reports.slice(offset, offset + PAGE_SIZE);

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

      {/* Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" method="get">
        <div>
          <label className="label">Cari</label>
          <input name="q" type="search" defaultValue={params.q ?? ""}
            placeholder="Judul / lokasi / penerima" className="input" />
        </div>
        <div>
          <label className="label">Program</label>
          <select name="campaign" defaultValue={params.campaign ?? ""} className="input">
            <option value="">Semua program</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Periode</label>
          <select name="period" defaultValue={params.period ?? ""} className="input">
            <option value="">Semua waktu</option>
            <option value="7d">7 hari terakhir</option>
            <option value="30d">30 hari terakhir</option>
            <option value="90d">3 bulan</option>
            <option value="1y">1 tahun</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={params.status ?? ""} className="input">
            <option value="">Semua</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/reports" className="btn-secondary">Reset</Link>
        </div>
      </form>

      <div className="flex items-center justify-between mb-4 text-sm text-slate-600">
        <span>Total <strong>{total}</strong> laporan</span>
        {totalAmount > 0 && <span>Total nominal: <strong className="text-primary">{idr(totalAmount)}</strong></span>}
      </div>

      {reports.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          {params.q || params.campaign || params.period || params.status
            ? "Tidak ada laporan yang cocok dengan filter."
            : "Belum ada laporan. Klik \"Buat Laporan\" untuk dokumentasi penyaluran pertama."}
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

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={total}
        baseUrl="/admin/reports"
        searchParams={params}
      />
    </div>
  );
}
