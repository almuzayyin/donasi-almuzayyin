import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicPageStore, publicSettingsStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("tentang");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Tentang",
    description: page?.metaDescription,
  };
}

export default async function TentangPage() {
  const [page, chairman] = await Promise.all([
    publicPageStore.findBySlug("tentang"),
    publicSettingsStore.getMany([
      "chairman_name",
      "chairman_title",
      "chairman_photo_url",
      "tagline",
    ]),
  ]);
  if (!page) notFound();

  const photoUrl = chairman.chairman_photo_url || "";
  const chairmanName = chairman.chairman_name || "Muhammad Lukman Hakim Al Hafidz";
  const chairmanTitle = chairman.chairman_title || "Ketua Yayasan";
  const tagline = chairman.tagline || "Mencetak Generasi Qur'ani";

  return (
    <>
      {/* Hero block: tagline + foto Ketua + nama */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-amber-50 border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="shrink-0">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden bg-primary/10 border-4 border-white shadow-lg ring-1 ring-primary/20">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`Foto ${chairmanName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-5xl text-primary/30">
                    👤
                  </div>
                )}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
                {tagline}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                Tentang Yayasan
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-700">
                Sambutan dari{" "}
                <strong className="text-slate-900">{chairmanName}</strong>
                {", "}
                <span className="text-slate-600">{chairmanTitle}</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <InfoPageView page={page} />
    </>
  );
}
