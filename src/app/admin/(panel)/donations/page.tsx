import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { donationStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function DonationsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  let donations = await donationStore.list();

  if (params.status) donations = donations.filter((d) => d.status === params.status);
  if (params.type) donations = donations.filter((d) => d.type === params.type);
  if (params.q) {
    const q = params.q.toLowerCase();
    donations = donations.filter(
      (d) =>
        d.orderId.toLowerCase().includes(q) ||
        d.donor.email.toLowerCase().includes(q) ||
        d.donor.name.toLowerCase().includes(q)
    );
  }

  const exportUrl = `/api/admin/donations/export${
    params.status || params.type || params.q
      ? "?" +
        new URLSearchParams(
          Object.entries(params).filter(([, v]) => v) as [string, string][]
        ).toString()
      : ""
  }`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Donasi</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/admin/donations/new" className="btn-secondary w-full sm:w-auto">
            + Input Manual
          </Link>
          <a href={exportUrl} className="btn-secondary w-full sm:w-auto">📥 Export CSV</a>
        </div>
      </div>

      {/* Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" method="get">
        <div>
          <label className="label">Cari</label>
          <input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Order ID / nama / email"
            className="input"
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={params.status ?? ""} className="input">
            <option value="">Semua</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="label">Jenis</label>
          <select name="type" defaultValue={params.type ?? ""} className="input">
            <option value="">Semua</option>
            <option value="uang">Donasi Uang</option>
            <option value="mushaf">Wakaf Mushaf</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/donations" className="btn-secondary">Reset</Link>
        </div>
      </form>

      <div className="card">
        <p className="text-sm text-slate-600 mb-4">
          Menampilkan <strong>{donations.length}</strong> donasi
        </p>

        {/* Mobile: card list */}
        <ul className="lg:hidden divide-y divide-slate-100 -mx-4 sm:-mx-6">
          {donations.map((d) => (
            <li key={d.id}>
              <Link
                href={`/admin/donations/${d.orderId}`}
                className="block px-4 sm:px-6 py-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${
                        d.type === "mushaf" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                      }`}>
                        {d.type === "mushaf" ? "Mushaf" : "Uang"}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-1.5 font-medium text-sm truncate">
                      {d.donor.anonymous ? "Hamba Allah" : d.donor.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{d.donor.email}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{d.orderId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{idr(d.amount)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(d.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {donations.length === 0 && (
            <li className="px-4 sm:px-6 py-8 text-center text-slate-500 text-sm">
              Belum ada donasi yang cocok dengan filter.
            </li>
          )}
        </ul>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <th className="py-2 px-2">Order ID</th>
              <th className="py-2 px-2">Tanggal</th>
              <th className="py-2 px-2">Donatur</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Jenis</th>
              <th className="py-2 px-2 text-right">Nominal</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Metode</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-2 font-mono text-xs">
                  <Link href={`/admin/donations/${d.orderId}`} className="text-primary hover:underline">
                    {d.orderId}
                  </Link>
                </td>
                <td className="py-2 px-2 text-slate-500 text-xs">
                  {new Date(d.createdAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2 px-2">{d.donor.anonymous ? "Hamba Allah" : d.donor.name}</td>
                <td className="py-2 px-2 text-slate-600 text-xs">{d.donor.email}</td>
                <td className="py-2 px-2">
                  <span className={`badge ${
                    d.type === "mushaf" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                  }`}>
                    {d.type === "mushaf" ? "Mushaf" : "Uang"}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-medium">{idr(d.amount)}</td>
                <td className="py-2 px-2">
                  <StatusBadge status={d.status} />
                </td>
                <td className="py-2 px-2 text-slate-500 text-xs">{d.paymentMethod ?? "-"}</td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Belum ada donasi yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
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
