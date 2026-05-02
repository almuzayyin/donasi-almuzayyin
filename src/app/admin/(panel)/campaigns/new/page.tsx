import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import CampaignForm from "../CampaignForm";

export default async function NewCampaignPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/campaigns" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Program
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-6">Buat Program Baru</h1>
      <CampaignForm mode="create" />
    </div>
  );
}
