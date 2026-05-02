import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@lib/supabase";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const supabase = getSupabaseAdmin();

    // Ambil dulu untuk dapat email
    const { data: row, error: fetchErr } = await supabase
      .from("donasi_admins")
      .select("id, email")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!row) return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    if (row.email.toLowerCase() === session.email.toLowerCase()) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
    }

    // Cari user di Supabase Auth & hapus
    const { data: list } = await supabase.auth.admin.listUsers();
    const authUser = list.users.find((u) => u.email?.toLowerCase() === row.email.toLowerCase());
    if (authUser) {
      const { error: delAuthErr } = await supabase.auth.admin.deleteUser(authUser.id);
      if (delAuthErr) console.error("[delete user] auth delete error:", delAuthErr);
    }

    // Hapus dari donasi_admins
    const { error: delErr } = await supabase.from("donasi_admins").delete().eq("id", id);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[DELETE /api/admin/users/:id]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
