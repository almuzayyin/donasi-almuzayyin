import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicPageStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("syarat-ketentuan");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Syarat & Ketentuan",
    description: page?.metaDescription,
  };
}

export default async function TermsPage() {
  const page = await publicPageStore.findBySlug("syarat-ketentuan");
  if (!page) notFound();
  return <InfoPageView page={page} />;
}
