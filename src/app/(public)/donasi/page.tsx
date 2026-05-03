import { publicCampaignStore, publicSettingsStore } from "@lib/storage";
import DonationForm from "./DonationForm";

interface Props {
  searchParams: Promise<{
    campaign?: string;
    type?: string;
  }>;
}

export default async function DonasiPage({ searchParams }: Props) {
  const params = await searchParams;
  let campaigns: { id: string; slug: string; title: string; type: "uang" | "mushaf" }[] = [];
  try {
    campaigns = (await publicCampaignStore.listActive()).map((c) => ({
      id: c.id, slug: c.slug, title: c.title, type: c.type,
    }));
  } catch (err) {
    console.error("[donasi page] gagal load campaigns:", err);
  }

  const initialType: "uang" | "mushaf" = params.type === "mushaf" ? "mushaf" : "uang";
  const selectedCampaign = campaigns.find((c) => c.slug === params.campaign);
  const mushafUnitPrice = await publicSettingsStore.getInt("mushaf_unit_price", 85_000);
  const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY || "";
  const midtransIsProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold">Form Donasi</h1>
      <p className="mt-2 text-sm sm:text-base text-slate-600">
        Isi data Anda di bawah ini. Anda akan diarahkan ke halaman pembayaran setelah submit.
      </p>
      <div className="mt-6 sm:mt-8">
        <DonationForm
          campaigns={campaigns}
          initialType={initialType}
          initialCampaign={selectedCampaign?.slug ?? ""}
          mushafUnitPrice={mushafUnitPrice}
          midtransClientKey={midtransClientKey}
          midtransIsProduction={midtransIsProduction}
        />
      </div>
    </div>
  );
}
