import { NextRequest, NextResponse } from "next/server";
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

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: categoryEnum.optional(),
  imageUrl: z.string().url().optional(),
  caption: z.string().max(300).optional().nullable(),
  takenAt: z.string().optional().nullable(),
  location: z.string().max(150).optional().nullable(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  isDocument: z.boolean().optional(),
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
    const existing = await galleryStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const updated = await galleryStore.save({
      ...existing,
      title: body.title ?? existing.title,
      description: body.description === undefined ? existing.description : body.description ?? undefined,
      category: body.category ?? existing.category,
      imageUrl: body.imageUrl ?? existing.imageUrl,
      caption: body.caption === undefined ? existing.caption : body.caption ?? undefined,
      takenAt: body.takenAt === undefined ? existing.takenAt : body.takenAt ?? undefined,
      location: body.location === undefined ? existing.location : body.location ?? undefined,
      sortOrder: body.sortOrder ?? existing.sortOrder,
      published: body.published ?? existing.published,
      isDocument: body.isDocument ?? existing.isDocument,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, gallery: updated });
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
    await galleryStore.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
