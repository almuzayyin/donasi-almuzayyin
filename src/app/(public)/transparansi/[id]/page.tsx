import Link from "next/link";
import { notFound } from "next/navigation";
import { publicCampaignStore, publicReportStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await publicReportStore.findPublishedById(id);
  if (!report) notFound();

  const campaign = report.campaignId
    ? (await publicCampaignStore.listActive()).find((c) => c.id === report.campaignId)
    : undefined;

  const expenseTotal = (report.expenses ?? []).reduce((s, e) => s + e.amount, 0);

  return (
    <article className="mx-auto max-w-4xl px-5 sm:px-6 py-8 sm:py-12">
      <Link href="/transparansi" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Transparansi
      </Link>

      <header className="mt-4 mb-6">
        {campaign && (
          <Link
            href={`/transparansi?campaign=${campaign.slug}`}
            className="inline-block text-sm text-primary font-semibold mb-2 hover:underline"
          >
            {campaign.title}
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{report.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>📅 {new Date(report.reportDate).toLocaleDateString("id-ID", {
            day: "2-digit", month: "long", year: "numeric",
          })}</span>
          {report.location && <span>📍 {report.location}</span>}
          {report.recipient && <span>👤 {report.recipient}</span>}
        </div>
      </header>

      {/* Summary card */}
      {(report.amountUsed || report.quantity) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {report.amountUsed != null && (
            <div className="card !p-4 sm:!p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Dipakai</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-primary">{idr(report.amountUsed)}</p>
            </div>
          )}
          {report.quantity != null && (
            <div className="card !p-4 sm:!p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Jumlah Disalurkan</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-primary">{report.quantity} eksemplar</p>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {report.description && (
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-2">Deskripsi Kegiatan</h2>
          <p className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
            {report.description}
          </p>
        </div>
      )}

      {/* Photo Gallery */}
      {report.photos.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">Dokumentasi Foto</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {report.photos.map((p, i) => (
              <figure key={i} className="space-y-1">
                <a href={p.url} target="_blank" rel="noreferrer" className="block">
                  <img src={p.url} alt={p.caption ?? ""} className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition" />
                </a>
                {p.caption && (
                  <figcaption className="text-xs text-slate-600 text-center">{p.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Expense Breakdown */}
      {report.expenses && report.expenses.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">Rincian Biaya</h2>
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-2">Pos Anggaran</th>
                  <th className="px-2 py-2">Catatan</th>
                  <th className="px-4 sm:px-6 py-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {report.expenses.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-4 sm:px-6 py-2.5 font-medium">{e.category}</td>
                    <td className="px-2 py-2.5 text-slate-600 text-xs">{e.description ?? "-"}</td>
                    <td className="px-4 sm:px-6 py-2.5 text-right font-medium">{idr(e.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td colSpan={2} className="px-4 sm:px-6 py-3 text-right font-semibold">Total</td>
                  <td className="px-4 sm:px-6 py-3 text-right font-bold text-primary">{idr(expenseTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center mt-8 text-xs text-slate-500">
        Laporan ini diterbitkan oleh Yayasan Islam Al Muzayyin Gadung.
      </div>
    </article>
  );
}
