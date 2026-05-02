import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { donationStore, campaignStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  searchParams: Promise<{ period?: string }>;
}

function getPeriodFrom(period?: string): { from?: Date; label: string } {
  const now = new Date();
  switch (period) {
    case "today":
      return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), label: "Hari Ini" };
    case "7d":
      return { from: new Date(now.getTime() - 7 * 86400000), label: "7 Hari" };
    case "30d":
      return { from: new Date(now.getTime() - 30 * 86400000), label: "30 Hari" };
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), label: "Bulan Ini" };
    case "ytd":
      return { from: new Date(now.getFullYear(), 0, 1), label: "Tahun Ini" };
    default:
      return { label: "Semua Waktu" };
  }
}

export default async function AdminDashboard({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const range = getPeriodFrom(params.period);

  const [donations, campaigns] = await Promise.all([
    donationStore.list(),
    campaignStore.list(),
  ]);

  const inRange = (iso?: string) => {
    if (!range.from) return true;
    if (!iso) return false;
    return new Date(iso).getTime() >= range.from.getTime();
  };

  const paid = donations.filter((d) => d.status === "paid" && inRange(d.paidAt));
  const totalCollected = paid.reduce((sum, d) => sum + d.amount, 0);
  const totalMushaf = paid
    .filter((d) => d.type === "mushaf")
    .reduce((sum, d) => sum + ((d as any).quantity ?? 0), 0);
  const uniqueDonors = new Set(paid.map((d) => d.donor.email)).size;
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  const recentDonations = donations.slice(0, 8);

  // Top 5 donatur dalam periode
  const donorTotals = new Map<string, { name: string; total: number; count: number }>();
  for (const d of paid) {
    const key = d.donor.email;
    const display = d.donor.anonymous ? "Hamba Allah" : d.donor.name;
    const existing = donorTotals.get(key);
    if (existing) {
      existing.total += d.amount;
      existing.count += 1;
    } else {
      donorTotals.set(key, { name: display, total: d.amount, count: 1 });
    }
  }
  const topDonors = Array.from(donorTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const stats = [
    { label: "Total Terkumpul", value: idr(totalCollected), accent: "text-primary" },
    { label: "Donasi Lunas", value: paid.length.toString() },
    { label: "Donatur Unik", value: uniqueDonors.toString() },
    { label: "Pending", value: pendingCount.toString(), accent: "text-amber-600" },
    { label: "Mushaf Terkumpul", value: `${totalMushaf} eksemplar` },
    { label: "Program Aktif", value: campaigns.filter((c) => c.active).length.toString() },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Ringkasan donasi Yayasan Islam Al Muzayyin · <strong>{range.label}</strong>
          </p>
        </div>
        <Link href="/admin/finance" className="btn-primary w-full sm:w-auto">
          📊 Laporan Keuangan
        </Link>
      </div>

      {/* Period filter */}
      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
        {[
          { key: "", label: "Semua" },
          { key: "today", label: "Hari Ini" },
          { key: "7d", label: "7 Hari" },
          { key: "30d", label: "30 Hari" },
          { key: "month", label: "Bulan Ini" },
          { key: "ytd", label: "Tahun Ini" },
        ].map((p) => (
          <Link
            key={p.key}
            href={p.key ? `/admin?period=${p.key}` : "/admin"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              (params.period ?? "") === p.key
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:border-primary"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card !p-3 sm:!p-4">
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider leading-tight">{s.label}</p>
            <p className={`mt-1.5 sm:mt-2 text-base sm:text-xl font-bold ${s.accent ?? "text-slate-900"} leading-tight`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Campaign progress */}
      <div className="card mb-8">
        <h2 className="font-bold text-lg mb-4">Progress per Program</h2>
        <div className="space-y-4">
          {campaigns.map((c) => {
            const pct = c.targetAmount > 0
              ? Math.min(100, (c.collectedAmount / c.targetAmount) * 100)
              : 0;
            return (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <Link href={`/admin/campaigns/${c.id}`} className="font-medium hover:text-primary">
                    {c.title}
                  </Link>
                  <span className="text-slate-600">
                    {idr(c.collectedAmount)} / {idr(c.targetAmount)} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && (
            <p className="text-slate-500 text-sm">Belum ada campaign.</p>
          )}
        </div>
      </div>

      {/* Top Donatur */}
      {topDonors.length > 0 && (
        <div className="card mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">🏆 Top Donatur ({range.label})</h2>
            <Link href="/admin/finance" className="text-sm text-primary font-semibold hover:underline">
              Lihat Top 10 →
            </Link>
          </div>
          <ol className="space-y-2">
            {topDonors.map((d, i) => (
              <li key={d.name + i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
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
        </div>
      )}

      {/* Recent donations */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Donasi Terbaru</h2>
          <Link href="/admin/donations" className="text-sm text-primary font-semibold hover:underline">
            Lihat semua →
          </Link>
        </div>
        {recentDonations.length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada donasi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Donatur</th>
                  <th className="py-2">Jenis</th>
                  <th className="py-2 text-right">Nominal</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs">
                      <Link href={`/admin/donations/${d.orderId}`} className="hover:text-primary">
                        {d.orderId}
                      </Link>
                    </td>
                    <td className="py-2">{d.donor.anonymous ? "Hamba Allah" : d.donor.name}</td>
                    <td className="py-2 capitalize">{d.type}</td>
                    <td className="py-2 text-right font-medium">{idr(d.amount)}</td>
                    <td className="py-2">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-2 text-slate-500 text-xs">
                      {new Date(d.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    expired: "bg-slate-100 text-slate-600",
    refunded: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[status] ?? "bg-slate-100"}`}>
      {status}
    </span>
  );
}
