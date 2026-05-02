import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { campaignStore } from "@lib/storage";
import { getSupabaseAdmin } from "@lib/supabase";

export const runtime = "nodejs";

const patchSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(["uang", "mushaf"]).optional(),
  targetAmount: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  endDate: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
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
    const existing = await campaignStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const updated = await campaignStore.save({
      ...existing,
      slug: body.slug ?? existing.slug,
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      type: body.type ?? existing.type,
      targetAmount: body.targetAmount ?? existing.targetAmount,
      active: body.active ?? existing.active,
      endDate: body.endDate === undefined ? existing.endDate : body.endDate ?? undefined,
      coverImage: body.coverImage === undefined ? existing.coverImage : body.coverImage ?? undefined,
    });
    return NextResponse.json({ campaign: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
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
    const existing = await campaignStore.findById(id);
    if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const { error } = await getSupabaseAdmin()
      .from("donasi_campaigns")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal hapus";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
