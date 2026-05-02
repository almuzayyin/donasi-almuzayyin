import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore, donationStore, reportStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
}

function getPeriodRange(period?: string): { from?: Date; to?: Date; label: string } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (period) {
    case "today":
      return { from: startOfDay(now), label: "Hari Ini" };
    case "7d":
      return { from: new Date(now.getTime() - 7 * 86400000), label: "7 Hari Terakhir" };
    case "30d":
      return { from: new Date(now.getTime() - 30 * 86400000), label: "30 Hari Terakhir" };
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), label: `Bulan ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}` };
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), label: `Tahun ${now.getFullYear()} (YTD)` };
    case "1y":
      return { from: new Date(now.getTime() - 365 * 86400000), label: "12 Bulan Terakhir" };
    default:
      return { label: "Semua Waktu" };
  }
}

export default async function FinancePage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const range = params.from || params.to
    ? {
        from: params.from ? new Date(params.from) : undefined,
        to: params.to ? new Date(params.to) : undefined,
        label: `${params.from ?? "—"} s.d. ${params.to ?? "—"}`,
      }
    : getPeriodRange(params.period);

  const [campaigns, donations, reports] = await Promise.all([
    campaignStore.list(),
    donationStore.list(),
    reportStore.list(),
  ]);

  const matchesRange = (iso?: string): boolean => {
    if (!range.from && !range.to) return true;
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (range.from && t < range.from.getTime()) return false;
    if (range.to && t > range.to.getTime()) return false;
    return true;
  };

  const paidDonations = donations.filter((d) => d.status === "paid" && matchesRange(d.paidAt));
  const periodReports = reports.filter((r) => matchesRange(r.reportDate));

  // Aggregate per campaign
  const perCampaign = campaigns.map((c) => {
    const cDonations = paidDonations.filter((d) => d.campaignId === c.id);
    const cReports = periodReports.filter((r) => r.campaignId === c.id);
    const collected = cDonations.reduce((s, d) => s + d.amount, 0);
    const distributed = cReports.reduce((s, r) => s + (r.amountUsed ?? 0), 0);
    const donorCount = new Set(cDonations.map((d) => d.donor.email)).size;
    const balance = collected - distributed;
    const distributedPct = collected > 0 ? (distributed / collected) * 100 : 0;
    return {
      campaign: c,
      collected,
      distributed,
      balance,
      donorCount,
      donationCount: cDonations.length,
      reportCount: cReports.length,
      distributedPct,
    };
  });

  const grandCollected = perCampaign.reduce((s, p) => s + p.collected, 0);
  const grandDistributed = perCampaign.reduce((s, p) => s + p.distributed, 0);
  const grandBalance = grandCollected - grandDistributed;
  const grandDonors = new Set(paidDonations.map((d) => d.donor.email)).size;

  // Donasi tanpa campaign (umum)
  const generalDonations = paidDonations.filter((d) => !d.campaignId);
  const generalAmount = generalDonations.reduce((s, d) => s + d.amount, 0);

  // Top donors
  const donorTotals = new Map<string, { name: string; total: number; count: number }>();
  for (const d of paidDonations) {
    const key = d.donor.email;
    const existing = donorTotals.get(key);
    const displayName = d.donor.anonymous ? "Hamba Allah" : d.donor.name;
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
    } else {
      donorTotals.set(key, { name: displayName, total: d.amount, count: 1 });
    }
  }
  const topDonors = Array.from(donorTotals.entries())
    .map(([email, v]) => ({ email, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const exportUrl = `/api/admin/finance/export${
    params.period || params.from || params.to
      ? "?" +
        new URLSearchParams(
          Object.entries(params).filter(([, v]) => v) as [string, string][]
        ).toString()
      : ""
  }`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Keuangan</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Saldo, terkumpul, dan tersalurkan per program. Periode: <strong>{range.label}</strong>
          </p>
        </div>
        <a href={exportUrl} className="btn-secondary w-full sm:w-auto">📥 Export CSV</a>
      </div>

      {/* Period Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3" method="get">
        <div className="sm:col-span-2">
          <label className="label">Periode Cepat</label>
          <select name="period" defaultValue={params.period ?? ""} className="input">
            <option value="">Semua waktu</option>
            <option value="today">Hari ini</option>
            <option value="7d">7 hari terakhir</option>
            <option value="30d">30 hari terakhir</option>
            <option value="month">Bulan ini</option>
            <option value="ytd">YTD (Year to Date)</option>
            <option value="1y">12 bulan terakhir</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/finance" className="btn-secondary">Reset</Link>
        </div>
        <p className="sm:col-span-4 text-xs text-slate-500">
          Atau pakai range custom: <code>?from=2026-01-01&to=2026-12-31</code> di URL.
        </p>
      </form>

      {/* Grand Total */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="card !p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Terkumpul</p>
          <p className="mt-1 text-lg sm:text-2xl font-bold text-primary leading-tight">{idr(grandCollected)}</p>
          <p className="text-xs text-slate-500 mt-1">{paidDonations.length} donasi</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tersalurkan</p>
          <p className="mt-1 text-lg sm:text-2xl font-bold text-amber-600 leading-tight">{idr(grandDistributed)}</p>
          <p className="text-xs text-slate-500 mt-1">{periodReports.length} laporan</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Saldo Tersedia</p>
          <p className={`mt-1 text-lg sm:text-2xl font-bold leading-tight ${grandBalance >= 0 ? "text-green-600" : "text-red-600"}`}>{idr(grandBalance)}</p>
          <p className="text-xs text-slate-500 mt-1">Belum disalurkan</p>
        </div>
        <div className="card !p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Donatur Unik</p>
          <p className="mt-1 text-lg sm:text-2xl font-bold leading-tight">{grandDonors}</p>
          <p className="text-xs text-slate-500 mt-1">orang</p>
        </div>
      </div>

      {/* Per Campaign Breakdown */}
      <div className="card mb-6">
        <h2 className="font-bold text-lg mb-4">Breakdown per Program</h2>
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="px-4 sm:px-6 py-2">Program</th>
                <th className="px-2 py-2 text-right">Terkumpul</th>
                <th className="px-2 py-2 text-right">Tersalurkan</th>
                <th className="px-2 py-2 text-right">Saldo</th>
                <th className="px-2 py-2 text-right">% Salur</th>
                <th className="px-4 sm:px-6 py-2 text-right">Donatur</th>
              </tr>
            </thead>
            <tbody>
              {perCampaign.map((p) => (
                <tr key={p.campaign.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 sm:px-6 py-3">
                    <Link href={`/admin/campaigns/${p.campaign.id}`} className="font-medium hover:text-primary">
                      {p.campaign.title}
                    </Link>
                    <p className="text-xs text-slate-500">{p.donationCount} donasi · {p.reportCount} laporan</p>
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-primary">{idr(p.collected)}</td>
                  <td className="px-2 py-3 text-right text-amber-700">{idr(p.distributed)}</td>
                  <td className={`px-2 py-3 text-right font-bold ${p.balance >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {idr(p.balance)}
                  </td>
                  <td className="px-2 py-3 text-right text-xs text-slate-600">
                    {p.distributedPct.toFixed(0)}%
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right text-slate-600">{p.donorCount}</td>
                </tr>
              ))}
              {generalAmount > 0 && (
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 sm:px-6 py-3 italic text-slate-600">
                    Donasi Umum (tanpa program)
                  </td>
                  <td className="px-2 py-3 text-right font-medium text-primary">{idr(generalAmount)}</td>
                  <td className="px-2 py-3 text-right text-slate-400">—</td>
                  <td className="px-2 py-3 text-right text-slate-400">—</td>
                  <td className="px-2 py-3 text-right text-slate-400">—</td>
                  <td className="px-4 sm:px-6 py-3 text-right text-slate-600">{generalDonations.length}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 sm:px-6 py-3">TOTAL</td>
                <td className="px-2 py-3 text-right text-primary">{idr(grandCollected)}</td>
                <td className="px-2 py-3 text-right text-amber-700">{idr(grandDistributed)}</td>
                <td className={`px-2 py-3 text-right ${grandBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {idr(grandBalance)}
                </td>
                <td className="px-2 py-3 text-right text-xs">
                  {grandCollected > 0 ? ((grandDistributed / grandCollected) * 100).toFixed(0) : 0}%
                </td>
                <td className="px-4 sm:px-6 py-3 text-right">{grandDonors}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Donors */}
      <div className="card">
        <h2 className="font-bold text-lg mb-4">🏆 Top 10 Donatur (Periode {range.label})</h2>
        {topDonors.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada donasi pada periode ini.</p>
        ) : (
          <ol className="space-y-2">
            {topDonors.map((d, i) => (
              <li key={d.email} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  i === 0 ? "bg-amber-100 text-amber-700" :
                  i === 1 ? "bg-slate-200 text-slate-700" :
                  i === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-slate-50 text-slate-500"
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.count} donasi</p>
                </div>
                <p className="font-bold text-primary">{idr(d.total)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
