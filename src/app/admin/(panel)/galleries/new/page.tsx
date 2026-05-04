import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import GalleryForm from "../GalleryForm";

export default async function NewGalleryPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/galleries" className="text-sm text-slate-500 hover:text-primary">
          ← Kembali ke Galeri
        </Link>
        <h1 className="page-title mt-2">Tambah Foto</h1>
        <p className="text-slate-600 mt-1 text-sm">
          Upload foto kegiatan atau dokumen untuk publikasi di halaman galeri.
        </p>
      </div>
      <GalleryForm mode="create" />
    </div>
  );
}
