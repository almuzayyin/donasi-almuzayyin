"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PageData {
  id?: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  isSystem?: boolean;
}

interface Props {
  initial?: PageData;
  mode: "create" | "edit";
}

export default function PageForm({ initial, mode }: Props) {
  const router = useRouter();
  const [data, setData] = useState<PageData>(
    initial ?? {
      slug: "",
      title: "",
      content: "## Heading\n\nKonten dalam markdown...",
      metaDescription: "",
      published: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  function update<K extends keyof PageData>(key: K, value: PageData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/pages" : `/api/admin/pages/${data.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!data.id) return;
    if (data.isSystem && !confirm("⚠️ Halaman ini di-mark sebagai SYSTEM. Hapus tetap?")) return;
    if (!confirm(`Yakin hapus halaman "${data.title}"?`)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pages/${data.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal hapus");
      }
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal hapus");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <div className="card space-y-4">
        <div>
          <label className="label">Judul</label>
          <input required className="input" value={data.title}
            onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className="label">Slug (URL)</label>
          <input
            required
            pattern="[a-z0-9-]+"
            className="input font-mono"
            value={data.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={data.isSystem && mode === "edit"}
            placeholder="contoh: tentang"
          />
          <p className="mt-1 text-xs text-slate-500">
            URL: <code>/{data.slug || "[slug]"}</code>
            {data.isSystem && mode === "edit" && " · slug system tidak bisa diubah"}
          </p>
        </div>
        <div>
          <label className="label">Meta Description (SEO, opsional)</label>
          <input className="input" maxLength={160} value={data.metaDescription ?? ""}
            onChange={(e) => update("metaDescription", e.target.value)}
            placeholder="Ringkasan singkat untuk Google search results" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
            checked={data.published}
            onChange={(e) => update("published", e.target.checked)} />
          Publikasikan halaman ini
        </label>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Konten (Markdown)</h2>
          <button type="button" onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-primary hover:underline">
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="prose prose-sm sm:prose-base max-w-none border border-slate-200 rounded-lg p-4 min-h-[400px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            required
            rows={20}
            className="input font-mono text-xs sm:text-sm"
            value={data.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder="## Heading"
          />
        )}
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-slate-600">Bantuan format Markdown</summary>
          <pre className="mt-2 p-3 bg-slate-50 rounded text-[11px] overflow-x-auto">
{`## Heading 2
### Heading 3

**Bold text**, *italic text*

- List item
- Item lain

[Link text](https://example.com)

> Blockquote

\`code inline\`
`}
          </pre>
        </details>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Menyimpan..." : mode === "create" ? "Buat Halaman" : "Simpan"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Batal
          </button>
        </div>
        {mode === "edit" && !data.isSystem && (
          <button type="button" onClick={onDelete} disabled={submitting}
            className="text-sm text-red-600 hover:text-red-700">
            Hapus halaman
          </button>
        )}
      </div>
    </form>
  );
}
