import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { settingsStore } from "@lib/storage";

export const runtime = "nodejs";

const patchSchema = z.object({
  key: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/),
  value: z.string().max(2000),
});

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = patchSchema.parse(await req.json());
    await settingsStore.set(body.key, body.value, session.email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[PATCH /api/admin/settings]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
