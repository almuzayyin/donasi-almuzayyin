import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@lib/supabase";

export const runtime = "nodejs";

const BUCKET = "donasi-reports";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ada" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File terlalu besar (max 10MB)" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: `Format tidak didukung: ${file.type}` }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const supabase = getSupabaseAdmin();
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });
    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ publicUrl: data.publicUrl, path });
  } catch (err) {
    console.error("[upload-report]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload gagal" }, { status: 500 });
  }
}
