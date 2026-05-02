import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";
import Pagination from "../Pagination";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CampaignsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  let campaigns = await campaignStore.list();

  if (params.q) {
    const q = params.q.toLowerCase();
    campaigns = campaigns.filter(
      (c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }
  if (params.type) campaigns = campaigns.filter((c) => c.type === params.type);
  if (params.status === "active") campaigns = campaigns.filter((c) => c.active);
  if (params.status === "inactive") campaigns = campaigns.filter((c) => !c.active);

  const total = campaigns.length;
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  campaigns = campaigns.slice(offset, offset + PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Program Donasi</h1>
        <Link href="/admin/campaigns/new" className="btn-primary w-full sm:w-auto">+ Buat Program Baru</Link>
      </div>

      {/* Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" method="get">
        <div>
          <label className="label">Cari</label>
          <input name="q" type="search" defaultValue={params.q ?? ""}
            placeholder="Judul / slug" className="input" />
        </div>
        <div>
          <label className="label">Jenis</label>
          <select name="type" defaultValue={params.type ?? ""} className="input">
            <option value="">Semua</option>
            <option value="uang">Donasi Uang</option>
            <option value="mushaf">Wakaf Mushaf</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" defaultValue={params.status ?? ""} className="input">
            <option value="">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/campaigns" className="btn-secondary">Reset</Link>
        </div>
      </form>

      <p className="text-sm text-slate-600 mb-3">
        Total <strong>{total}</strong> program
      </p>

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
            {params.q || params.type || params.status
              ? "Tidak ada program yang cocok dengan filter."
              : (
                <>
                  Belum ada program.{" "}
                  <Link href="/admin/campaigns/new" className="text-primary font-semibold">Buat sekarang</Link>.
                </>
              )}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={total}
        baseUrl="/admin/campaigns"
        searchParams={params}
      />
    </div>
  );
}
