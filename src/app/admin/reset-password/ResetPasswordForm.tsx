"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal set password");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Password Baru</label>
        <input
          required
          type="password"
          minLength={8}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          autoFocus
        />
        <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter</p>
      </div>
      <div>
        <label className="label">Konfirmasi Password</label>
        <input
          required
          type="password"
          minLength={8}
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Menyimpan..." : "Set Password & Masuk"}
      </button>
    </form>
  );
}
