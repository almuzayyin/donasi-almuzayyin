import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicPageStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("kontak");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Kontak",
    description: page?.metaDescription,
  };
}

export default async function KontakPage() {
  const page = await publicPageStore.findBySlug("kontak");
  if (!page) notFound();
  return <InfoPageView page={page} />;
}
