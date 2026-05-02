import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
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

const reportSchema = z.object({
  campaignId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  amountUsed: z.number().int().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  reportDate: z.string(),
  location: z.string().optional(),
  recipient: z.string().optional(),
  photos: z.array(photoSchema).default([]),
  published: z.boolean().default(true),
  expenses: z.array(expenseSchema).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = reportSchema.parse(await req.json());
    const id = randomUUID();
    const now = new Date().toISOString();

    await reportStore.save({
      id,
      campaignId: body.campaignId,
      title: body.title,
      description: body.description,
      amountUsed: body.amountUsed,
      quantity: body.quantity,
      reportDate: body.reportDate,
      location: body.location,
      recipient: body.recipient,
      photos: body.photos,
      documents: [],
      published: body.published,
      createdAt: now,
      createdBy: session.email,
    });

    if (body.expenses.length > 0) {
      await expenseStore.replaceAll(id, body.expenses.map((e, idx) => ({
        category: e.category,
        description: e.description,
        amount: e.amount,
        sortOrder: e.sortOrder ?? idx,
      })));
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[POST /api/admin/reports]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
