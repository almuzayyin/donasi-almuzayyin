import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@lib/supabase";

interface LogRow {
  id: number;
  order_id: string;
  event_type: string;
  payload: unknown;
  signature_valid: boolean | null;
  created_at: string;
}

export default async function LogsPage() {
  await requireAdmin();

  const { data, error } = await getSupabaseAdmin()
    .from("donasi_payment_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const logs = (data as LogRow[] | null) ?? [];

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="page-title">Webhook Logs</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          100 notifikasi terbaru dari Midtrans (untuk debugging).
        </p>
      </div>

      {error && (
        <div className="card mb-4 bg-red-50 border-red-200 text-red-700">
          {error.message}
        </div>
      )}

      {logs.length === 0 ? (
        <div className="card text-center text-slate-500">
          Belum ada webhook log. Akan terisi setelah ada transaksi pembayaran.
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
    </div>
  );
}
