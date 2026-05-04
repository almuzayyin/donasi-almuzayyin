import Link from "next/link";
import type { Metadata } from "next";
import { publicGalleryStore } from "@lib/storage";
import type { GalleryCategory } from "@lib/types";
import GalleryLightbox from "./GalleryLightbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Kegiatan — Yayasan Al Muzayyin",
  description:
    "Dokumentasi visual kegiatan Yayasan Islam Al Muzayyin Gadung — tahfidz, santunan, pengajian, pembangunan, dan wakaf.",
};

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  umum: "Umum",
  tahfidz: "Tahfidz",
  santunan: "Santunan",
  pembangunan: "Pembangunan",
  pengajian: "Pengajian",
  wakaf: "Wakaf",
  dokumentasi: "Dokumentasi",
};

const CATEGORY_ORDER: GalleryCategory[] = [
  "tahfidz",
  "santunan",
  "pembangunan",
  "pengajian",
  "wakaf",
  "umum",
];

interface Props {
  searchParams: Promise<{ kategori?: string }>;
}

export default async function GaleriPage({ searchParams }: Props) {
  const params = await searchParams;
  const kategori = (params.kategori ?? "") as GalleryCategory | "";

  const items = await publicGalleryStore.listPublished({
    isDocument: false,
    category: kategori || undefined,
    limit: 200,
  });

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary">
          Dokumentasi
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold">Galeri Kegiatan</h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Bukti visual aktivitas Yayasan Islam Al Muzayyin — kegiatan tahfidz, santunan,
          pengajian, pembangunan, dan wakaf yang telah dilaksanakan.
        </p>
      </div>

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 justify-center">
        <Link
          href="/galeri"
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            !kategori
              ? "bg-primary text-white"
              : "bg-white border border-slate-200 text-slate-700 hover:border-primary"
          }`}
        >
          Semua
        </Link>
        {CATEGORY_ORDER.map((cat) => (
          <Link
            key={cat}
            href={`/galeri?kategori=${cat}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              kategori === cat
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:border-primary"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card text-center text-slate-500 py-12">
          {kategori
            ? `Belum ada foto kategori "${CATEGORY_LABELS[kategori as GalleryCategory] ?? kategori}".`
            : "Belum ada foto kegiatan. Cek kembali nanti."}
        </div>
      ) : (
        <GalleryLightbox items={items} categoryLabels={CATEGORY_LABELS} />
      )}
    </div>
  );
}
