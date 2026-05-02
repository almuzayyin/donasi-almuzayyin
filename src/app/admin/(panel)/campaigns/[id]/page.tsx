import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";
import CampaignForm from "../CampaignForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const campaign = await campaignStore.findById(id);
  if (!campaign) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/campaigns" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Program
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-6">Edit Program</h1>
      <CampaignForm
        mode="edit"
        initial={{
          id: campaign.id,
          slug: campaign.slug,
          title: campaign.title,
          description: campaign.description,
          type: campaign.type,
          targetAmount: campaign.targetAmount,
          active: campaign.active,
          endDate: campaign.endDate,
          coverImage: campaign.coverImage,
        }}
      />
    </div>
  );
}
