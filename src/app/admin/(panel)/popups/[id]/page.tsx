import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore, popupStore } from "@lib/storage";
import PopupForm from "../PopupForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPopupPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const popup = await popupStore.findById(id);
  if (!popup) notFound();

  const campaigns = (await campaignStore.list()).map((c) => ({
    id: c.id, title: c.title, type: c.type,
  }));

  return (
    <div className="max-w-3xl">
      <Link href="/admin/popups" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Popup
      </Link>
      <h1 className="page-title mt-2 mb-5 sm:mb-6">Edit Popup</h1>
      <PopupForm
        mode="edit"
        campaigns={campaigns}
        initial={{
          id: popup.id,
          donorName: popup.donorName,
          donorLocation: popup.donorLocation,
          amount: popup.amount,
          campaignId: popup.campaignId,
          type: popup.type,
          customMessage: popup.customMessage,
          displayAt: popup.displayAt,
          showUntil: popup.showUntil,
          active: popup.active,
        }}
      />
    </div>
  );
}
