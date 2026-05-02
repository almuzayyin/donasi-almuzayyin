import { NextRequest, NextResponse } from "next/server";
import { publicDonationFeed } from "@lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20") || 20);

  try {
    const items = since
      ? await publicDonationFeed.listSince(since)
      : await publicDonationFeed.listRecent(limit);
    return NextResponse.json(
      { items, fetchedAt: new Date().toISOString() },
      {
        headers: {
          // Cache 30 detik di edge, donatur baru muncul dalam max 30 detik
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/recent-donations]", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
