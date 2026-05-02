import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { popupStore } from "@lib/storage";

export const runtime = "nodejs";

const patchSchema = z.object({
  donorName: z.string().min(1).max(100).optional(),
  donorLocation: z.string().max(100).optional().nullable(),
  amount: z.number().int().min(0).optional().nullable(),
  campaignId: z.string().optional().nullable(),
  type: z.enum(["uang", "mushaf"]).optional(),
  customMessage: z.string().max(200).optional().nullable(),
  displayAt: z.string().optional(),
  showUntil: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = patchSchema.parse(await req.json());
    const existing = await popupStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const updated = await popupStore.save({
      ...existing,
      donorName: body.donorName ?? existing.donorName,
      donorLocation: body.donorLocation === undefined ? existing.donorLocation : body.donorLocation ?? undefined,
      amount: body.amount === undefined ? existing.amount : body.amount ?? undefined,
      campaignId: body.campaignId === undefined ? existing.campaignId : body.campaignId ?? undefined,
      type: body.type ?? existing.type,
      customMessage: body.customMessage === undefined ? existing.customMessage : body.customMessage ?? undefined,
      displayAt: body.displayAt ?? existing.displayAt,
      showUntil: body.showUntil === undefined ? existing.showUntil : body.showUntil ?? undefined,
      active: body.active ?? existing.active,
    });
    return NextResponse.json({ ok: true, popup: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await popupStore.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
