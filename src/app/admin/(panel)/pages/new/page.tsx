import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import PageForm from "../PageForm";

export default async function NewPagePage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/pages" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Halaman
      </Link>
      <h1 className="page-title mt-2 mb-5 sm:mb-6">Tambah Halaman</h1>
      <PageForm mode="create" />
    </div>
  );
}
