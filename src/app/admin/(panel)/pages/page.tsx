import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { pageStore } from "@lib/storage";

export default async function PagesListPage() {
  await requireAdmin();
  const pages = await pageStore.list();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Halaman Statis</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Edit konten halaman publik (Tentang, Kontak, Privasi, Syarat, Refund).
          </p>
        </div>
        <Link href="/admin/pages/new" className="btn-secondary w-full sm:w-auto">
          + Tambah Halaman
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="card text-center text-slate-500">
          Belum ada halaman.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pages.map((p) => (
            <Link
              key={p.id}
              href={`/admin/pages/${p.id}`}
              className="card hover:border-primary transition flex items-start gap-3"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                📄
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold leading-tight">{p.title}</h3>
                  <div className="flex gap-1 shrink-0">
                    {p.isSystem && <span className="badge bg-amber-100 text-amber-700">System</span>}
                    {!p.published && <span className="badge bg-slate-100 text-slate-600">Draft</span>}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-mono">/{p.slug}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Update {new Date(p.updatedAt).toLocaleDateString("id-ID", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 card bg-slate-50 border-slate-200">
        <h3 className="font-semibold text-sm mb-2">📝 Cara Edit Konten</h3>
        <ol className="text-xs text-slate-600 list-decimal pl-5 space-y-1">
          <li>Klik salah satu kartu di atas</li>
          <li>Edit konten dalam format <strong>Markdown</strong> — ## untuk heading, **bold**, *italic*, [link](url), `- item` untuk list</li>
          <li>Preview akan muncul di samping</li>
          <li>Centang "Publikasikan" untuk tampil di publik</li>
          <li>Save</li>
        </ol>
      </div>
    </div>
  );
}
