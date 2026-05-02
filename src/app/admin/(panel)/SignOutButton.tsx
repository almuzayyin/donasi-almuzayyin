"use client";

import { createBrowserClient } from "@supabase/ssr";

export default function SignOutButton() {
  async function signOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <button
      onClick={signOut}
      className="mt-2 w-full text-left text-xs text-red-600 hover:text-red-700"
    >
      Keluar
    </button>
  );
}
