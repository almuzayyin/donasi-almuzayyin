import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default async function CampaignsPage() {
  await requireAdmin();
  const campaigns = await campaignStore.list();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Program Donasi</h1>
        <Link href="/admin/campaigns/new" className="btn-primary w-full sm:w-auto">+ Buat Program Baru</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {campaigns.map((c) => {
          const pct = c.targetAmount > 0
            ? Math.min(100, (c.collectedAmount / c.targetAmount) * 100)
            : 0;
          return (
            <article key={c.id} className="card flex gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-3xl overflow-hidden">
                {c.coverImage ? (
                  <img src={c.coverImage} alt="" className="h-full w-full object-cover" />
                ) : c.type === "mushaf" ? "📖" : "💰"}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/campaigns/${c.id}`} className="font-bold hover:text-primary">
                    {c.title}
                  </Link>
                  {c.active ? (
                    <span className="text-[11px] font-semibold rounded-full bg-green-100 text-green-700 px-2 py-0.5">Aktif</span>
                  ) : (
                    <span className="text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">Nonaktif</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">/{c.slug}</p>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{c.description}</p>
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-600">
                    <span>{idr(c.collectedAmount)} / {idr(c.targetAmount)}</span>
                    <span>{c.donorCount} donatur</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {campaigns.length === 0 && (
          <div className="card md:col-span-2 text-center text-slate-500">
            Belum ada program. <Link href="/admin/campaigns/new" className="text-primary font-semibold">Buat sekarang</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
