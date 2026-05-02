import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicPageStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("pengembalian-dana");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Kebijakan Pengembalian Dana",
    description: page?.metaDescription,
  };
}

export default async function RefundPage() {
  const page = await publicPageStore.findBySlug("pengembalian-dana");
  if (!page) notFound();
  return <InfoPageView page={page} />;
}
