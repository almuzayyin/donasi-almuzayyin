import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { checkPaymentStatus } from "@lib/donations";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  try {
    const result = await checkPaymentStatus({ orderId });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync gagal";
    console.error("[sync]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
