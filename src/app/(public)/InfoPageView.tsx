import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { InfoPage } from "@lib/types";

export default function InfoPageView({ page }: { page: InfoPage }) {
  return (
    <article className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{page.title}</h1>
      </header>
      <div className="prose prose-slate prose-sm sm:prose-base max-w-none
        prose-headings:font-bold prose-headings:text-slate-900
        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-accent prose-blockquote:bg-amber-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic
        prose-strong:text-slate-900
        prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.content}</ReactMarkdown>
      </div>
      <p className="mt-10 text-xs text-slate-500 text-center">
        Terakhir diperbarui: {new Date(page.updatedAt).toLocaleDateString("id-ID", {
          day: "2-digit", month: "long", year: "numeric",
        })}
      </p>
    </article>
  );
}
