import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publicGalleryStore, publicPageStore } from "@lib/storage";
import InfoPageView from "../InfoPageView";
import DocumentScan from "@/components/DocumentScan";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await publicPageStore.findBySlug("legalitas");
  return {
    title: page ? `${page.title} — Yayasan Al Muzayyin` : "Legalitas",
    description: page?.metaDescription,
  };
}

export default async function LegalitasPage() {
  const [page, documents] = await Promise.all([
    publicPageStore.findBySlug("legalitas"),
    publicGalleryStore.listPublished({ isDocument: true, limit: 50 }),
  ]);
  if (!page) notFound();

  return (
    <>
      <InfoPageView page={page} />

      {/* Scan Dokumen Resmi */}
      {documents.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 sm:px-6 pb-12 sm:pb-16">
          <div className="border-t border-slate-200 pt-8 sm:pt-10">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
              Bukti Dokumen
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold">Scan Dokumen Resmi</h2>
            <p className="mt-2 text-sm text-slate-600">
              Berikut scan dokumen legal yayasan untuk verifikasi keabsahan. Klik untuk
              melihat detail. Semua dokumen ber-watermark.
            </p>

            <div className="mt-5 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {documents.map((d) => (
                <DocumentScan
                  key={d.id}
                  imageUrl={d.imageUrl}
                  title={d.title}
                  caption={d.caption}
                  description={d.description}
                />
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm">
              <p className="font-semibold text-amber-900 mb-1">⚠️ Hati-hati Penyalahgunaan</p>
              <p className="text-amber-800 text-xs leading-relaxed">
                Scan di atas dilengkapi watermark dan hanya untuk transparansi publik.
                Setiap penggunaan di luar verifikasi keabsahan yayasan adalah pelanggaran.
                Verifikasi independen melalui{" "}
                <a
                  href="https://ahu.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  ahu.go.id
                </a>
                {" "}dengan nomor SK <code className="bg-white px-1 rounded text-[11px]">AHU-0017282.AH.01.04.Tahun 2023</code>.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
