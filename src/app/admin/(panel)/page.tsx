import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { donationStore, campaignStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default async function AdminDashboard() {
  await requireAdmin();

  const [donations, campaigns] = await Promise.all([
    donationStore.list(),
    campaignStore.list(),
  ]);

  const paid = donations.filter((d) => d.status === "paid");
  const totalCollected = paid.reduce((sum, d) => sum + d.amount, 0);
  const totalMushaf = paid
    .filter((d) => d.type === "mushaf")
    .reduce((sum, d) => sum + ((d as any).quantity ?? 0), 0);
  const uniqueDonors = new Set(paid.map((d) => d.donor.email)).size;
  const pendingCount = donations.filter((d) => d.status === "pending").length;

  const recentDonations = donations.slice(0, 8);

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
            Ringkasan donasi Yayasan Islam Al Muzayyin
          </p>
        </div>
        <Link href="/admin/donations" className="btn-primary w-full sm:w-auto">
          Lihat Semua Donasi
        </Link>
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
