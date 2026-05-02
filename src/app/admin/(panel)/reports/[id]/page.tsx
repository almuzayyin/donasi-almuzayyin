import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore, reportStore } from "@lib/storage";
import ReportForm from "../ReportForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditReportPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const report = await reportStore.findById(id);
  if (!report) notFound();

  const campaigns = (await campaignStore.list()).map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
  }));

  return (
    <div className="max-w-3xl">
      <Link href="/admin/reports" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Laporan
      </Link>
      <h1 className="page-title mt-2 mb-5 sm:mb-6">Edit Laporan</h1>
      <ReportForm
        mode="edit"
        campaigns={campaigns}
        initial={{
          id: report.id,
          campaignId: report.campaignId,
          title: report.title,
          description: report.description,
          amountUsed: report.amountUsed,
          quantity: report.quantity,
          reportDate: report.reportDate,
          location: report.location,
          recipient: report.recipient,
          photos: report.photos.map((p) => ({ url: p.url, caption: p.caption ?? "" })),
          expenses: (report.expenses ?? []).map((e) => ({
            category: e.category,
            description: e.description ?? "",
            amount: e.amount,
          })),
          published: report.published,
        }}
      />
    </div>
  );
}
