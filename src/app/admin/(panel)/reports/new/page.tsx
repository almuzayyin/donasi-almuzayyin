import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";
import ReportForm from "../ReportForm";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const campaigns = (await campaignStore.list()).map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
  }));

  const initialCampaign = params.campaign
    ? campaigns.find((c) => c.id === params.campaign)?.id
    : undefined;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/reports" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Laporan
      </Link>
      <h1 className="page-title mt-2 mb-5 sm:mb-6">Buat Laporan Penyaluran</h1>
      <ReportForm
        mode="create"
        campaigns={campaigns}
        initial={{ campaignId: initialCampaign ?? "" }}
      />
    </div>
  );
}
