import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@lib/donations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();
    const result = await handleWebhook({
      notification,
      verifySignature: true,
    });
    return NextResponse.json({ ok: true, status: result.donation.status });
  } catch (err) {
    console.error("[webhook] error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Midtrans webhook endpoint. Pakai POST." });
}
