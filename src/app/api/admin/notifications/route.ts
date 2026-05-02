import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { donationStore } from "@lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  try {
    const all = await donationStore.list();
    const cutoffMs = since ? new Date(since).getTime() : Date.now() - 24 * 60 * 60 * 1000;

    // Donasi PAID yang baru sejak `since`
    const newPaid = all.filter(
      (d) =>
        d.status === "paid" &&
        d.paidAt &&
        new Date(d.paidAt).getTime() > cutoffMs
    );
    // Donasi PENDING terbaru (untuk monitoring)
    const newPending = all.filter(
      (d) =>
        d.status === "pending" &&
        new Date(d.createdAt).getTime() > cutoffMs
    );

    return NextResponse.json({
      newPaid: newPaid.map((d) => ({
        orderId: d.orderId,
        donor: d.donor.anonymous ? "Hamba Allah" : d.donor.name,
        amount: d.amount,
        type: d.type,
        paidAt: d.paidAt,
        isManual: d.isManual ?? false,
      })),
      newPending: newPending.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/admin/notifications]", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
