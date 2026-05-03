import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@lib/donations";

export const runtime = "nodejs";

/**
 * Midtrans webhook endpoint.
 *
 * Best practice: SELALU return HTTP 200 ke Midtrans (kecuali parse error fatal)
 * agar tidak masuk retry loop. Validation/business errors di-log, bukan di-throw.
 */
export async function POST(req: NextRequest) {
  let notification: Record<string, unknown> = {};

  try {
    notification = await req.json();
  } catch {
    // Body kosong atau bukan JSON — kemungkinan Midtrans "Test Notification"
    // dengan empty body. Return 200 supaya tes lulus.
    console.warn("[webhook] empty/invalid body — likely Midtrans test ping");
    return NextResponse.json({ ok: true, message: "ping received" });
  }

  // Test ping dari dashboard Midtrans biasanya tidak punya order_id
  // atau pakai order_id dummy. Sambut dengan 200 tanpa proses.
  if (!notification.order_id) {
    console.log("[webhook] no order_id in payload — test ping or invalid", notification);
    return NextResponse.json({ ok: true, message: "received (no order_id)" });
  }

  try {
    const result = await handleWebhook({
      notification,
      verifySignature: true,
    });
    return NextResponse.json({ ok: true, status: result.donation.status });
  } catch (err) {
    // Signature invalid / order not found / dst — tetap 200 supaya Midtrans
    // tidak retry. Error tetap di-log untuk debug.
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[webhook] handler error:", message, notification);
    return NextResponse.json({ ok: true, warning: message });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Midtrans webhook endpoint. Pakai POST dari Midtrans dashboard.",
  });
}
