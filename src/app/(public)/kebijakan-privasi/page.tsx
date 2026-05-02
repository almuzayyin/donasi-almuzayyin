import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicPageStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("kebijakan-privasi");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Kebijakan Privasi",
    description: page?.metaDescription,
  };
}

export default async function PrivacyPage() {
  const page = await publicPageStore.findBySlug("kebijakan-privasi");
  if (!page) notFound();
  return <InfoPageView page={page} />;
}
