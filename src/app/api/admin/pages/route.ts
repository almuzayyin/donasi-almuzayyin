import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { pageStore } from "@lib/storage";

export const runtime = "nodejs";

const createSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, tanda hubung").min(2).max(80),
  title: z.string().min(2).max(200),
  content: z.string().min(1).max(50000),
  metaDescription: z.string().max(200).optional(),
  published: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const existing = await pageStore.findById(body.slug);
    if (existing) {
      return NextResponse.json({ error: `Slug "${body.slug}" sudah dipakai` }, { status: 400 });
    }
    const now = new Date().toISOString();
    const page = await pageStore.save({
      id: randomUUID(),
      slug: body.slug,
      title: body.title,
      content: body.content,
      metaDescription: body.metaDescription,
      published: body.published,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
      updatedBy: session.email,
    });
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[POST /api/admin/pages]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
