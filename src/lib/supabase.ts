import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _admin: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

/**
 * Server-side admin client (bypass RLS). Pakai untuk semua operasi
 * tulis ke donasi_* dan read donasi_donations / donasi_payment_logs.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum di-set. Cek .env."
    );
  }
  _admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

/**
 * Anon client (RLS aktif). Pakai hanya untuk read publik (campaigns aktif).
 */
export function getSupabaseAnon(): SupabaseClient {
  if (_anon) return _anon;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_ANON_KEY belum di-set. Cek .env."
    );
  }
  _anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _anon;
}
