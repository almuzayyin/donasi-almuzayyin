import { NextRequest, NextResponse } from "next/server";
import { donationStore } from "@lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const donation = await donationStore.findById(orderId);
  if (!donation) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ donation });
}
