import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";
import PopupForm from "../PopupForm";

export default async function NewPopupPage() {
  await requireAdmin();
  const campaigns = (await campaignStore.list()).map((c) => ({
    id: c.id, title: c.title, type: c.type,
  }));
  return (
    <div className="max-w-3xl">
      <Link href="/admin/popups" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Popup
      </Link>
      <h1 className="page-title mt-2 mb-5 sm:mb-6">Buat Popup Manual</h1>
      <PopupForm mode="create" campaigns={campaigns} />
    </div>
  );
}
