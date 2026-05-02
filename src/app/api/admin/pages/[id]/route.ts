import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { pageStore } from "@lib/storage";

export const runtime = "nodejs";

const patchSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(80).optional(),
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  metaDescription: z.string().max(200).optional().nullable(),
  published: z.boolean().optional(),
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
    const existing = await pageStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    // Sistem pages: slug tidak boleh diubah
    if (existing.isSystem && body.slug && body.slug !== existing.slug) {
      return NextResponse.json({ error: "Slug halaman system tidak dapat diubah" }, { status: 400 });
    }

    // Cek slug bentrok
    if (body.slug && body.slug !== existing.slug) {
      const conflict = await pageStore.findById(body.slug);
      if (conflict) {
        return NextResponse.json({ error: `Slug "${body.slug}" sudah dipakai` }, { status: 400 });
      }
    }

    const updated = await pageStore.save({
      ...existing,
      slug: body.slug ?? existing.slug,
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      metaDescription: body.metaDescription === undefined
        ? existing.metaDescription
        : body.metaDescription ?? undefined,
      published: body.published ?? existing.published,
      updatedAt: new Date().toISOString(),
      updatedBy: session.email,
    });

    return NextResponse.json({ ok: true, page: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[PATCH /api/admin/pages/:id]", err);
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
    const existing = await pageStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    await pageStore.delete(existing.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
