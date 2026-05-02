import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Env-based allowlist sebagai bootstrap (kalau DB kosong)
const ENV_ALLOWLIST = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export interface AdminRow {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  created_by: string | null;
}

/**
 * Cek apakah email termasuk admin (DB allowlist OR env bootstrap).
 * Aman dipanggil dari middleware (edge) karena pakai REST API Supabase.
 */
export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const lower = email.toLowerCase();

  if (ENV_ALLOWLIST.includes(lower)) return true;

  if (!SUPABASE_URL || !SERVICE_KEY) return false;

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("donasi_admins")
      .select("id")
      .eq("email", lower)
      .maybeSingle();
    return !!data;
  } catch (err) {
    console.error("[isAdminEmail] DB lookup error:", err);
    return false;
  }
}

/**
 * Daftar semua admin (env + DB merged, deduplicated).
 */
export async function listAdmins(): Promise<AdminRow[]> {
  if (!SUPABASE_URL || !SERVICE_KEY) return [];
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("donasi_admins")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[listAdmins]", error);
    return [];
  }
  return (data as AdminRow[]) ?? [];
}
