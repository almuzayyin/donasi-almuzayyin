"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function generatePassword() {
    const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pw = "";
    for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pw);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim() || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah admin");
      setSuccess(`✓ ${email} berhasil ditambah. Beri tahu password ini ke admin baru.`);
      setEmail("");
      setFullName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label">Email</label>
        <input
          required
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@al-muzayyin.org"
          autoComplete="off"
        />
      </div>
      <div>
        <label className="label">Nama Lengkap (opsional)</label>
        <input
          type="text"
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nama"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">Password Awal</label>
          <button type="button" onClick={generatePassword} className="text-xs text-primary hover:underline">
            Generate acak
          </button>
        </div>
        <input
          required
          type="text"
          minLength={8}
          className="input font-mono text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 karakter"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-500">
          Beri tahu admin baru password ini, lalu suruh ganti via &ldquo;Lupa password?&rdquo;
        </p>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-green-800 text-sm">
          {success}
        </div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Menambah..." : "+ Tambah Admin"}
      </button>
    </form>
  );
}
