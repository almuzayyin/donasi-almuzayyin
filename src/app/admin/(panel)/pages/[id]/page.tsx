import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { pageStore } from "@lib/storage";
import PageForm from "../PageForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const page = await pageStore.findById(id);
  if (!page) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/pages" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Halaman
      </Link>
      <div className="flex items-center justify-between gap-3 mt-2 mb-5 sm:mb-6">
        <h1 className="page-title">Edit Halaman</h1>
        <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
          className="text-sm text-primary hover:underline">
          Lihat publik ↗
        </a>
      </div>
      <PageForm
        mode="edit"
        initial={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          content: page.content,
          metaDescription: page.metaDescription,
          published: page.published,
          isSystem: page.isSystem,
        }}
      />
    </div>
  );
}
