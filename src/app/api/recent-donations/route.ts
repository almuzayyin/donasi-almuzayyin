import { NextRequest, NextResponse } from "next/server";
import { publicDonationFeed, publicPopupStore, campaignStore } from "@lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FeedItem {
  donor: string;
  amount: number;
  campaign: string | null;
  paidAt: string;
  type: "uang" | "mushaf";
  customMessage?: string;
  source: "real" | "manual";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "30") || 30);

  try {
    const [real, popups, campaigns] = await Promise.all([
      publicDonationFeed.listRecent(limit),
      publicPopupStore.listActive(limit),
      campaignStore.list(),
    ]);
    const campaignMap = new Map(campaigns.map((c) => [c.id, c.title]));

    const realItems: FeedItem[] = real.map((r) => ({
      donor: r.donor,
      amount: r.amount,
      campaign: r.campaign,
      paidAt: r.paidAt,
      type: r.type,
      source: "real" as const,
    }));

    const manualItems: FeedItem[] = popups.map((p) => ({
      donor: p.donorLocation ? `${p.donorName} dari ${p.donorLocation}` : p.donorName,
      amount: p.amount ?? 0,
      campaign: p.campaignId ? campaignMap.get(p.campaignId) ?? null : null,
      paidAt: p.displayAt,
      type: p.type,
      customMessage: p.customMessage,
      source: "manual" as const,
    }));

    // Merge & sort by displayAt desc, take limit
    const merged = [...realItems, ...manualItems]
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
      .slice(0, limit);

    return NextResponse.json(
      { items: merged, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/recent-donations]", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
