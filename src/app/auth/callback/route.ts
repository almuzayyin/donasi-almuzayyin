import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type EmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/admin";
  const errorParam = searchParams.get("error");

  // Supabase mengirim ?error=... saat link kedaluwarsa
  if (errorParam) {
    console.error("[auth/callback] error param:", errorParam, searchParams.get("error_description"));
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
  }

  const supabase = await createServerClient();

  // PKCE flow (default browser client) — kirim code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/callback] exchangeCodeForSession error:", error.message, error);
  }

  // Token hash flow (template email default tertentu) — kirim token_hash + type
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/callback] verifyOtp error:", error.message, error);
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`);
}
