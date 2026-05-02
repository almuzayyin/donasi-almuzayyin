import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@lib/supabase";
import Pagination from "../Pagination";

interface LogRow {
  id: number;
  order_id: string;
  event_type: string;
  payload: unknown;
  signature_valid: boolean | null;
  created_at: string;
}

const PAGE_SIZE = 25;

interface Props {
  searchParams: Promise<{
    q?: string;
    event?: string;
    sig?: string;
    page?: string;
  }>;
}

export default async function LogsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  let query = getSupabaseAdmin()
    .from("donasi_payment_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.q) query = query.ilike("order_id", `%${params.q}%`);
  if (params.event) query = query.eq("event_type", params.event);
  if (params.sig === "valid") query = query.eq("signature_valid", true);
  if (params.sig === "invalid") query = query.eq("signature_valid", false);

  const { data, error, count } = await query;
  const logs = (data as LogRow[] | null) ?? [];
  const total = count ?? 0;

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="page-title">Webhook Logs</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          100 notifikasi terbaru dari Midtrans (untuk debugging).
        </p>
      </div>

      {/* Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3" method="get">
        <div>
          <label className="label">Cari Order ID</label>
          <input name="q" type="search" defaultValue={params.q ?? ""}
            placeholder="DNS-..." className="input font-mono text-sm" />
        </div>
        <div>
          <label className="label">Event</label>
          <select name="event" defaultValue={params.event ?? ""} className="input">
            <option value="">Semua</option>
            <option value="webhook">Webhook</option>
            <option value="sync">Sync</option>
          </select>
        </div>
        <div>
          <label className="label">Signature</label>
          <select name="sig" defaultValue={params.sig ?? ""} className="input">
            <option value="">Semua</option>
            <option value="valid">Valid</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/logs" className="btn-secondary">Reset</Link>
        </div>
      </form>

      <p className="text-sm text-slate-600 mb-3">
        Total <strong>{total}</strong> log
      </p>

      {error && (
        <div className="card mb-4 bg-red-50 border-red-200 text-red-700">
          {error.message}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="card text-center text-slate-500">
          {params.q || params.event || params.sig
            ? "Tidak ada log yang cocok dengan filter."
            : "Belum ada webhook log. Akan terisi setelah ada transaksi pembayaran."}
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <details key={log.id} className="card">
              <summary className="cursor-pointer flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-xs text-slate-500">#{log.id}</span>
                <span className="font-mono text-xs">{log.order_id}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                  {log.event_type}
                </span>
                {log.signature_valid !== null && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    log.signature_valid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    sig: {log.signature_valid ? "valid" : "INVALID"}
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString("id-ID")}
                </span>
              </summary>
              <pre className="mt-3 rounded bg-slate-50 p-3 text-xs overflow-x-auto">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </details>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={total}
        baseUrl="/admin/logs"
        searchParams={params}
      />
    </div>
  );
}
