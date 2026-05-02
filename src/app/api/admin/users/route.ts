import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { listAdmins } from "@/lib/admin-allowlist";
import { getSupabaseAdmin } from "@lib/supabase";

export const runtime = "nodejs";

const createSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  password: z.string().min(8),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admins = await listAdmins();
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createSchema.parse(await req.json());
    const email = body.email.toLowerCase();

    const supabase = getSupabaseAdmin();

    // Cek dulu kalau sudah ada di allowlist DB
    const { data: existing } = await supabase
      .from("donasi_admins")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar sebagai admin" }, { status: 400 });
    }

    // Buat / update Supabase Auth user
    let userId: string | null = null;
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: body.fullName ? { full_name: body.fullName } : undefined,
    });

    if (createErr) {
      // Kalau user sudah ada di auth.users, update password-nya
      if (createErr.message.toLowerCase().includes("already") || createErr.message.toLowerCase().includes("registered")) {
        const { data: list } = await supabase.auth.admin.listUsers();
        const found = list.users.find((u) => u.email?.toLowerCase() === email);
        if (!found) throw createErr;
        const { error: updateErr } = await supabase.auth.admin.updateUserById(found.id, {
          password: body.password,
          email_confirm: true,
        });
        if (updateErr) throw updateErr;
        userId = found.id;
      } else {
        throw createErr;
      }
    } else {
      userId = createData.user?.id ?? null;
    }

    // Simpan ke donasi_admins
    const now = new Date().toISOString();
    const { error: insertErr } = await supabase.from("donasi_admins").insert({
      id: randomUUID(),
      email,
      full_name: body.fullName ?? null,
      created_at: now,
      created_by: session.email,
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true, email, userId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/admin/users]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
