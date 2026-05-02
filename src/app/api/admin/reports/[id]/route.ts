import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { reportStore, expenseStore } from "@lib/storage";

export const runtime = "nodejs";

const photoSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
});

const expenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().int().min(0),
  sortOrder: z.number().int().optional(),
});

const patchSchema = z.object({
  campaignId: z.string().optional().nullable(),
  title: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  amountUsed: z.number().int().min(0).optional().nullable(),
  quantity: z.number().int().min(0).optional().nullable(),
  reportDate: z.string().optional(),
  location: z.string().optional().nullable(),
  recipient: z.string().optional().nullable(),
  photos: z.array(photoSchema).optional(),
  published: z.boolean().optional(),
  expenses: z.array(expenseSchema).optional(),
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
    const existing = await reportStore.findById(id, false);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    await reportStore.save({
      ...existing,
      campaignId: body.campaignId ?? existing.campaignId,
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      amountUsed: body.amountUsed === undefined ? existing.amountUsed : body.amountUsed ?? undefined,
      quantity: body.quantity === undefined ? existing.quantity : body.quantity ?? undefined,
      reportDate: body.reportDate ?? existing.reportDate,
      location: body.location ?? existing.location,
      recipient: body.recipient ?? existing.recipient,
      photos: body.photos ?? existing.photos,
      published: body.published ?? existing.published,
    });

    if (body.expenses) {
      await expenseStore.replaceAll(id, body.expenses.map((e, idx) => ({
        category: e.category,
        description: e.description,
        amount: e.amount,
        sortOrder: e.sortOrder ?? idx,
      })));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[PATCH /api/admin/reports/:id]", err);
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
    await reportStore.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
