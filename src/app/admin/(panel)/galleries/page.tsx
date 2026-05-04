import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { galleryStore } from "@lib/storage";
import type { GalleryCategory } from "@lib/types";
import Pagination from "../Pagination";

const PAGE_SIZE = 24;

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  umum: "Umum",
  tahfidz: "Tahfidz",
  santunan: "Santunan",
  pembangunan: "Pembangunan",
  pengajian: "Pengajian",
  wakaf: "Wakaf",
  dokumentasi: "Dokumentasi",
};

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string; // "doc" | "photo"
    status?: string; // "published" | "draft"
    page?: string;
  }>;
}

export default async function GalleriesListPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  let items = await galleryStore.list();

  if (params.q) {
    const q = params.q.toLowerCase();
    items = items.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.caption ?? "").toLowerCase().includes(q) ||
        (g.location ?? "").toLowerCase().includes(q)
    );
  }
  if (params.category) items = items.filter((g) => g.category === params.category);
  if (params.type === "doc") items = items.filter((g) => g.isDocument);
  if (params.type === "photo") items = items.filter((g) => !g.isDocument);
  if (params.status === "published") items = items.filter((g) => g.published);
  if (params.status === "draft") items = items.filter((g) => !g.published);

  const total = items.length;
  const currentPage = Math.max(1, parseInt(params.page ?? "1") || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const pageItems = items.slice(offset, offset + PAGE_SIZE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Galeri Foto</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Foto kegiatan & dokumen yayasan untuk halaman publik <code>/galeri</code>.
          </p>
        </div>
        <Link href="/admin/galleries/new" className="btn-primary w-full sm:w-auto">
          + Tambah Foto
        </Link>
      </div>

      {/* Filter */}
      <form className="card mb-5 sm:mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3" method="get">
        <div>
          <label className="label">Cari</label>
          <input
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Judul / caption / lokasi"
            className="input"
          />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select name="category" defaultValue={params.category ?? ""} className="input">
            <option value="">Semua</option>
            {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jenis</label>
          <select name="type" defaultValue={params.type ?? ""} className="input">
            <option value="">Semua</option>
            <option value="photo">Foto Kegiatan</option>
            <option value="doc">Foto Dokumen</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href="/admin/galleries" className="btn-secondary">Reset</Link>
        </div>
      </form>

      <p className="text-sm text-slate-600 mb-3">
        Total <strong>{total}</strong> foto
      </p>

      {pageItems.length === 0 ? (
        <div className="card text-center text-slate-500 py-10">
          Belum ada foto. Klik &ldquo;Tambah Foto&rdquo; untuk upload dokumentasi pertama.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {pageItems.map((g) => (
            <Link
              key={g.id}
              href={`/admin/galleries/${g.id}`}
              className="group card !p-2 hover:border-primary transition"
            >
              <div className="aspect-square overflow-hidden rounded bg-slate-100 mb-2">
                <img
                  src={g.imageUrl}
                  alt={g.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <p className="font-semibold text-sm line-clamp-1">{g.title}</p>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="badge bg-primary/10 text-primary">
                  {CATEGORY_LABELS[g.category] ?? g.category}
                </span>
                <div className="flex gap-1">
                  {g.isDocument && (
                    <span className="badge bg-amber-100 text-amber-700">DOK</span>
                  )}
                  {!g.published && (
                    <span className="badge bg-slate-200 text-slate-600">Draft</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={total}
        baseUrl="/admin/galleries"
        searchParams={params}
      />
    </div>
  );
}
