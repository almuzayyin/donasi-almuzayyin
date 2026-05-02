"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Mode = "signin" | "forgot" | "sent";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) throw err;
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message === "Invalid login credentials"
            ? "Email atau password salah."
            : err.message
          : "Login gagal"
      );
      setSubmitting(false);
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = getClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
      });
      if (err) throw err;
      setMode("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal kirim email reset");
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "sent") {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-green-800 text-sm text-center">
        <p className="font-semibold">Email reset password terkirim 📧</p>
        <p className="mt-1">Cek inbox <strong>{email}</strong> dan klik link untuk set password baru.</p>
        <button
          onClick={() => { setMode("signin"); setError(null); }}
          className="mt-3 text-xs underline"
        >
          Kembali ke login
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={onForgot} className="space-y-4">
        <p className="text-sm text-slate-600">
          Masukkan email Anda. Kami akan kirim link untuk set password baru.
        </p>
        <div>
          <label className="label">Email Admin</label>
          <input
            required
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@al-muzayyin.org"
            autoComplete="email"
            autoFocus
          />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
            {error}
          </div>
        )}
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Mengirim..." : "Kirim Email Reset"}
        </button>
        <button
          type="button"
          onClick={() => { setMode("signin"); setError(null); }}
          className="block w-full text-center text-sm text-slate-600 hover:text-primary"
        >
          ← Kembali ke login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSignIn} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input
          required
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@al-muzayyin.org"
          autoComplete="email"
          autoFocus
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">Password</label>
          <button
            type="button"
            onClick={() => { setMode("forgot"); setError(null); }}
            className="text-xs text-primary hover:underline"
          >
            Lupa password?
          </button>
        </div>
        <input
          required
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Masuk..." : "Login"}
      </button>
    </form>
  );
}
