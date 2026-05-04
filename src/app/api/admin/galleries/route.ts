import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { galleryStore } from "@lib/storage";

export const runtime = "nodejs";

const categoryEnum = z.enum([
  "tahfidz",
  "santunan",
  "pembangunan",
  "pengajian",
  "wakaf",
  "dokumentasi",
  "umum",
]);

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: categoryEnum.default("umum"),
  imageUrl: z.string().url(),
  caption: z.string().max(300).optional(),
  takenAt: z.string().optional(),
  location: z.string().max(150).optional(),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true),
  isDocument: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const id = randomUUID();
    const now = new Date().toISOString();
    const gallery = await galleryStore.save({
      id,
      title: body.title,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      caption: body.caption,
      takenAt: body.takenAt,
      location: body.location,
      sortOrder: body.sortOrder,
      published: body.published,
      isDocument: body.isDocument,
      createdAt: now,
      updatedAt: now,
      createdBy: session.email,
    });
    return NextResponse.json({ ok: true, gallery });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[POST /api/admin/galleries]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
