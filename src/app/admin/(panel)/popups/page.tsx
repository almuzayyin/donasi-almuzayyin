import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { popupStore, campaignStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default async function PopupsListPage() {
  await requireAdmin();
  const [popups, campaigns] = await Promise.all([
    popupStore.list(),
    campaignStore.list(),
  ]);
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.title]));

  function isExpired(p: typeof popups[0]) {
    return p.showUntil && new Date(p.showUntil) < new Date();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Popup Manual</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Popup notifikasi tambahan yang muncul di landing page (selain donasi nyata).
          </p>
        </div>
        <Link href="/admin/popups/new" className="btn-primary w-full sm:w-auto">
          + Buat Popup
        </Link>
      </div>

      {popups.length === 0 ? (
        <div className="card text-center text-slate-500 py-10">
          Belum ada popup manual. Klik &ldquo;Buat Popup&rdquo; untuk highlight donasi yang sudah ada
          atau testimonial.
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map((p) => {
            const expired = isExpired(p);
            const status = !p.active ? "Non-aktif" : expired ? "Kedaluwarsa" : "Aktif";
            const statusClass = !p.active
              ? "bg-slate-100 text-slate-600"
              : expired
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700";

            return (
              <Link
                key={p.id}
                href={`/admin/popups/${p.id}`}
                className="card flex items-start justify-between gap-3 hover:border-primary transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge ${statusClass}`}>{status}</span>
                    <span className={`badge ${
                      p.type === "mushaf" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
                    }`}>
                      {p.type === "mushaf" ? "Mushaf" : "Uang"}
                    </span>
                    {p.campaignId && (
                      <span className="text-xs text-slate-500">{campaignMap.get(p.campaignId) ?? "-"}</span>
                    )}
                  </div>
                  <p className="font-semibold">
                    {p.donorName}
                    {p.donorLocation && <span className="font-normal text-slate-600"> · {p.donorLocation}</span>}
                  </p>
                  {p.amount != null && (
                    <p className="text-primary font-bold text-sm mt-0.5">{idr(p.amount)}</p>
                  )}
                  {p.customMessage && (
                    <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{p.customMessage}&rdquo;</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Tampil sejak {new Date(p.displayAt).toLocaleString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                    {p.showUntil && ` · sampai ${new Date(p.showUntil).toLocaleDateString("id-ID")}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 card bg-slate-50 border-slate-200">
        <h3 className="font-semibold text-sm mb-2">💡 Kapan Pakai Popup Manual?</h3>
        <ul className="text-xs text-slate-600 list-disc pl-5 space-y-1">
          <li>Saat awal launch belum banyak donasi nyata — buat ~10 popup &ldquo;simulasi&rdquo; untuk social proof</li>
          <li>Highlight donasi besar yang masuk via transfer manual lama</li>
          <li>Demo / presentasi yayasan ke calon donatur</li>
          <li>Testimonial donatur tetap (dengan persetujuan mereka)</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          ⚠️ Etika: gunakan data nyata (atau anonim &ldquo;Hamba Allah&rdquo;) dengan jujur. Jangan mengarang
          donasi yang tidak pernah ada — bisa rusak kepercayaan donatur.
        </p>
      </div>
    </div>
  );
}
