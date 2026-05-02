import { cookies } from "next/headers";
import { createServerClient as _createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase client SSR yang baca/tulis cookie session.
 * Dipakai dari Server Component / Route Handler / Server Action.
 */
export async function createServerClient(): Promise<SupabaseClient> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_ANON_KEY belum di-set di .env.local"
    );
  }
  const cookieStore = await cookies();
  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const c of toSet) {
            cookieStore.set(c.name, c.value, c.options);
          }
        } catch {
          // dipanggil dari Server Component — abaikan, refresh akan di middleware
        }
      },
    },
  });
}
