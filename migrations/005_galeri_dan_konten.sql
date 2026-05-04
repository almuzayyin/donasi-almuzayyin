-- =============================================================================
-- MIGRATION 005: Galeri Kegiatan + Update Konten Yayasan
-- =============================================================================
-- 1. Tambahkan tabel donasi_galleries (foto kegiatan & dokumentasi)
-- 2. Tambah setting tagline + chairman info
-- 3. Update halaman /tentang dengan sambutan ketua + visi-misi pesantren
-- =============================================================================

-- ===== 1. SETTINGS BARU =====================================================

INSERT INTO public.donasi_settings (key, value, description, is_public, updated_at, updated_by)
VALUES
  ('tagline', 'Mencetak Generasi Qur''ani', 'Tagline utama yayasan untuk hero landing page', TRUE, now()::text, 'system'),
  ('chairman_name', 'Muhammad Lukman Hakim Al Hafidz', 'Nama lengkap Ketua Yayasan untuk sambutan', TRUE, now()::text, 'system'),
  ('chairman_title', 'Ketua Yayasan', 'Jabatan Ketua untuk attribution sambutan', TRUE, now()::text, 'system'),
  ('chairman_photo_url', '', 'URL foto Ketua Yayasan (upload via admin)', TRUE, now()::text, 'system'),
  ('logo_url', '/logo.png', 'URL logo yayasan (default: /public/logo.png)', TRUE, now()::text, 'system')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now()::text;

-- ===== 2. TABEL GALERI ======================================================

CREATE TABLE IF NOT EXISTS public.donasi_galleries (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  description text,
  category    text NOT NULL DEFAULT 'umum',  -- tahfidz, santunan, pembangunan, pengajian, wakaf, dokumentasi, umum
  image_url   text NOT NULL,
  caption     text,
  taken_at    text,                           -- ISO date kapan foto diambil
  location    text,
  sort_order  integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT TRUE,
  is_document boolean NOT NULL DEFAULT FALSE, -- TRUE untuk scan dokumen legal
  created_at  text NOT NULL,
  updated_at  text NOT NULL,
  created_by  text
);

CREATE INDEX IF NOT EXISTS idx_galleries_published ON public.donasi_galleries(published);
CREATE INDEX IF NOT EXISTS idx_galleries_category  ON public.donasi_galleries(category);
CREATE INDEX IF NOT EXISTS idx_galleries_taken_at  ON public.donasi_galleries(taken_at DESC NULLS LAST);

ALTER TABLE public.donasi_galleries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donasi_galleries_public_read"  ON public.donasi_galleries;
DROP POLICY IF EXISTS "donasi_galleries_service_all"  ON public.donasi_galleries;

CREATE POLICY "donasi_galleries_public_read"
  ON public.donasi_galleries FOR SELECT
  USING (published = TRUE);

CREATE POLICY "donasi_galleries_service_all"
  ON public.donasi_galleries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===== 3. UPDATE HALAMAN /tentang ===========================================
-- Sambutan Ketua di awal, lalu visi-misi pesantren-focused, lalu profil & pengurus

UPDATE public.donasi_pages SET
  content = $tentang$## Sambutan Ketua Yayasan

> Assalamu'alaikum Warahmatullahi Wabarakatuh,
>
> Puji syukur kehadirat Allah SWT, atas rahmat dan hidayah-Nya, sehingga kita semua senantiasa dalam keadaan sehat dan dalam lindungan-Nya. Shalawat serta salam semoga senantiasa tercurah kepada junjungan kita Nabi Muhammad SAW.
>
> Selamat datang di website resmi **Yayasan Islam Al Muzayyin Gadung**.
>
> Kami, dari jajaran pengurus yayasan, mengucapkan terima kasih atas kunjungan Anda. Website ini kami hadirkan sebagai jembatan informasi, komunikasi, dan transparansi antara pihak yayasan, pengelola pendidikan, wali murid, serta masyarakat luas.
>
> Yayasan Islam Al Muzayyin Gadung berkomitmen penuh dalam memberikan layanan pendidikan dan sosial yang berkualitas, berlandaskan nilai-nilai iman, taqwa, serta Ahlussunnah wal Jamaah. Kami meyakini bahwa **pendidikan adalah investasi terbaik bagi masa depan bangsa**. Oleh karena itu, kami terus berupaya meningkatkan sarana, prasarana, serta kompetensi tenaga pendidik guna melahirkan generasi yang unggul, berkarakter, dan kompeten.
>
> Kami mengucapkan terima kasih kepada seluruh pihak — para guru, staf, wali murid, dan donatur — yang telah memberikan kepercayaan serta dukungan penuh kepada kami. Partisipasi aktif Bapak/Ibu sekalian adalah energi bagi kami untuk terus berkembang dan berinovasi.
>
> Semoga website ini memberikan manfaat yang nyata dan memudahkan kita dalam bersinergi. Selamat menjelajahi informasi di situs ini.
>
> Wassalamu'alaikum Warahmatullahi Wabarakatuh.
>
> **Muhammad Lukman Hakim Al Hafidz**
> *Ketua Yayasan*

---

## Visi

> "Mencetak generasi hafiz yang **Berakhlaq Mulia, Berprestasi, serta Memahami Pengetahuan dan Teknologi**."

## Misi

1. Melaksanakan program **Tahfizul Qur'an** secara disiplin, tertib, dan sesuai target.
2. Mewujudkan **pengamalan Al-Qur'an** dalam kehidupan sehari-hari.
3. Menumbuhkan pengamalan ajaran **Ahlussunnah Wal Jama'ah An-Nahdliyyah** sehingga tumbuh pribadi yang beriman, bertaqwa, dan berakhlaqul karimah.
4. Meningkatkan bakat siswa dalam **olahraga dan seni**.
5. Mengimplementasikan **kultur pesantren** yang bermartabat, santun dalam bingkai kekeluargaan.

---

## Profil Yayasan

Yayasan Islam Al Muzayyin Gadung adalah lembaga sosial keagamaan berbasis **Tahfidz Al-Qur'an**, yang berkhidmat dalam bidang dakwah, pendidikan, dan santunan sosial. Yayasan beroperasi di Desa Gadung, Kecamatan Driyorejo, Kabupaten Gresik, Jawa Timur, dan menaungi **Pondok Pesantren, SMP, dan SMA Tahfidzul Qur'an**.

## Legalitas

| | |
|---|---|
| **Nama Resmi** | Yayasan Islam Al Muzayyin Gadung |
| **Akta Notaris** | Nomor 10, tanggal 11 Oktober 2023 (Notaris Roma Sukmawati, S.H., M.Kn.) |
| **SK Menkumham** | AHU-0017282.AH.01.04.Tahun 2023 (18 Oktober 2023) |
| **Daftar Yayasan** | AHU-0024997.AH.01.12.Tahun 2023 |
| **Surat Domisili** | No. 470/493/437.108.16/2023, 9 Oktober 2023 (Kepala Desa Gadung) |
| **Kedudukan** | Kabupaten Gresik, Jawa Timur |
| **Kekayaan Awal** | Rp 20.000.000 |

Lihat detail dokumen di halaman [Legalitas](/legalitas).

## Pengurus

### Pembina
- **Ketua**: Mardjuki
- **Anggota**: Moch. Arief Jaka Samudra
- **Anggota**: Sofwan

### Pengurus
- **Ketua**: Muhammad Lukman Hakim Al Hafidz
- **Sekretaris**: Rendy Dwi Adi Putra
- **Bendahara**: Lailatul Hidayah
- **Bendahara**: Nilna Khumairo'

### Pengawas
- **Ketua**: Nanang Indrayana, S.E.

---

## Hadits Pengingat

> "Apabila anak Adam meninggal, terputus seluruh amalnya kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak shalih yang mendoakannya."
>
> — HR. Muslim
$tentang$,
  meta_description = 'Profil Yayasan Islam Al Muzayyin Gadung — Pondok Pesantren, SMP, SMA Tahfidzul Qur''an. Sambutan Ketua, visi-misi, dan struktur pengurus.',
  updated_at = now()::text,
  updated_by = 'system'
WHERE slug = 'tentang';

SELECT 'Migration 005 applied — galeri table + content baru.' AS message;
