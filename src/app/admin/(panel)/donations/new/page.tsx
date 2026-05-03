import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { campaignStore, settingsStore } from "@lib/storage";
import ManualDonationForm from "./ManualDonationForm";

export default async function NewManualDonationPage() {
  await requireAdmin();
  const campaigns = (await campaignStore.list()).map((c) => ({
    id: c.id, title: c.title, type: c.type,
  }));
  const mushafUnitPrice = await settingsStore.getInt("mushaf_unit_price", 85_000);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/donations" className="text-sm text-slate-600 hover:text-primary">
        ← Kembali ke Daftar Donasi
      </Link>
      <h1 className="page-title mt-2 mb-2">Input Donasi Manual</h1>
      <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">
        Untuk donasi yang masuk lewat transfer bank di luar Midtrans.
        Admin input data donatur + bukti transfer, dan donasi langsung tercatat sebagai &ldquo;paid&rdquo;.
      </p>
      <ManualDonationForm campaigns={campaigns} mushafUnitPrice={mushafUnitPrice} />
    </div>
  );
}
