import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { galleryStore } from "@lib/storage";
import GalleryForm from "../GalleryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const item = await galleryStore.findById(id);
  if (!item) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/galleries" className="text-sm text-slate-500 hover:text-primary">
          ← Kembali ke Galeri
        </Link>
        <h1 className="page-title mt-2">Edit Foto</h1>
        <p className="text-slate-600 mt-1 text-sm">
          Update detail atau hapus foto.
        </p>
      </div>
      <GalleryForm
        mode="edit"
        initial={{
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          caption: item.caption,
          takenAt: item.takenAt,
          location: item.location,
          sortOrder: item.sortOrder,
          published: item.published,
          isDocument: item.isDocument,
        }}
      />
    </div>
  );
}
