import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { popupStore } from "@lib/storage";

export const runtime = "nodejs";

const schema = z.object({
  donorName: z.string().min(1).max(100),
  donorLocation: z.string().max(100).optional(),
  amount: z.number().int().min(0).optional(),
  campaignId: z.string().optional(),
  type: z.enum(["uang", "mushaf"]),
  customMessage: z.string().max(200).optional(),
  displayAt: z.string(),
  showUntil: z.string().optional(),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const id = randomUUID();
    const now = new Date().toISOString();
    const popup = await popupStore.save({
      id,
      donorName: body.donorName,
      donorLocation: body.donorLocation,
      amount: body.amount,
      campaignId: body.campaignId,
      type: body.type,
      customMessage: body.customMessage,
      displayAt: body.displayAt,
      showUntil: body.showUntil,
      active: body.active,
      createdAt: now,
      createdBy: session.email,
    });
    return NextResponse.json({ ok: true, popup });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[POST /api/admin/popups]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
