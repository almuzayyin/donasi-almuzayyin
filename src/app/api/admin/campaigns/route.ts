import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";

export const runtime = "nodejs";

const createSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  description: z.string().min(1),
  type: z.enum(["uang", "mushaf"]),
  targetAmount: z.number().int().positive(),
  active: z.boolean().default(true),
  endDate: z.string().optional(),
  coverImage: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const existing = await campaignStore.findById(body.slug);
    if (existing) {
      return NextResponse.json({ error: `Slug "${body.slug}" sudah dipakai` }, { status: 400 });
    }
    const now = new Date().toISOString();
    const campaign = await campaignStore.save({
      id: randomUUID(),
      slug: body.slug,
      title: body.title,
      description: body.description,
      type: body.type,
      targetAmount: body.targetAmount,
      collectedAmount: 0,
      donorCount: 0,
      startDate: now,
      endDate: body.endDate,
      active: body.active,
      coverImage: body.coverImage,
      createdAt: now,
    });
    return NextResponse.json({ campaign });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/admin/campaigns]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
