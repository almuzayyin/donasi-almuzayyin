import Link from "next/link";

interface Props {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  pageSize,
  totalItems,
  baseUrl,
  searchParams = {},
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  function buildUrl(page: number): string {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }

  // Page numbers: smart compaction (1 ... 5 6 [7] 8 9 ... 20)
  const pages: (number | "...")[] = [];
  const showPageNumber = (p: number) => p >= 1 && p <= totalPages;
  const candidates = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    2,
    totalPages - 1,
  ]);
  const sorted = Array.from(candidates).filter(showPageNumber).sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push("...");
    pages.push(sorted[i]);
  }

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
      <p className="text-slate-600">
        Menampilkan <strong>{firstItem}</strong>–<strong>{lastItem}</strong> dari{" "}
        <strong>{totalItems}</strong>
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm"
          >
            ← Sebelumnya
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 text-sm">
            ← Sebelumnya
          </span>
        )}
        <div className="hidden sm:flex items-center gap-1 mx-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`gap-${i}`} className="px-2 text-slate-400">…</span>
            ) : (
              <Link
                key={p}
                href={buildUrl(p)}
                className={`min-w-[34px] text-center px-2.5 py-1.5 rounded-lg text-sm ${
                  p === currentPage
                    ? "bg-primary text-white font-semibold"
                    : "bg-white border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p}
              </Link>
            )
          )}
        </div>
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm"
          >
            Selanjutnya →
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 text-sm">
            Selanjutnya →
          </span>
        )}
      </div>
    </nav>
  );
}
