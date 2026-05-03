-- =============================================================================
-- MIGRATION 004: Update Konten dengan Data Yayasan Asli
-- =============================================================================
-- Apply data legal yayasan (Akta, SK Menkumham, Surat Domisili, Bank, Pengurus)
-- ke settings table + halaman Tentang & Kontak + buat halaman Legalitas baru.
-- =============================================================================

-- ===== 1. SETTINGS ===========================================================

-- Tambah 4 setting baru (bank info + alamat)
INSERT INTO public.donasi_settings (key, value, description, is_public, updated_at, updated_by)
VALUES
  ('bank_name', 'Bank Mandiri (KCP Surabaya Pakuwon City)', 'Bank rekening yayasan untuk transfer manual', TRUE, now()::text, 'system'),
  ('bank_account_number', '140-00-3993992-2', 'Nomor rekening yayasan', TRUE, now()::text, 'system'),
  ('bank_account_name', 'Yayasan Islam Al Muzayyin Gadung', 'Nama pemilik rekening', TRUE, now()::text, 'system'),
  ('yayasan_address', 'Jl. Gadung 1, RT 003 RW 001, Desa Gadung, Kec. Driyorejo, Kab. Gresik 61177, Jawa Timur', 'Alamat lengkap sekretariat yayasan', TRUE, now()::text, 'system'),
  ('legal_akta', 'Nomor 10, tanggal 11 Oktober 2023 (Notaris Roma Sukmawati, S.H., M.Kn.)', 'Akta Notaris pendirian yayasan', TRUE, now()::text, 'system'),
  ('legal_sk_menkumham', 'AHU-0017282.AH.01.04.Tahun 2023', 'Nomor SK Menkumham', TRUE, now()::text, 'system'),
  ('legal_daftar_yayasan', 'AHU-0024997.AH.01.12.Tahun 2023', 'Nomor Daftar Yayasan', TRUE, now()::text, 'system'),
  ('legal_surat_domisili', '470/493/437.108.16/2023', 'Nomor Surat Keterangan Domisili dari Kepala Desa Gadung', TRUE, now()::text, 'system'),
  ('pic_name', 'Muhammad Lukman Hakim', 'Penanggung jawab / Ketua Pengurus', TRUE, now()::text, 'system')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = now()::text;

-- Update existing settings dengan data lebih akurat
UPDATE public.donasi_settings SET
  value = 'donasi@yayasanislamalmuzayin.com',
  updated_at = now()::text
WHERE key = 'contact_email';

-- ===== 2. UPDATE HALAMAN TENTANG ============================================

UPDATE public.donasi_pages SET
  content = $tentang$## Profil Yayasan

Yayasan Islam Al Muzayyin Gadung adalah lembaga sosial keagamaan berbasis **Tahfidz Al-Qur'an**, yang berkhidmat dalam bidang dakwah, pendidikan, dan santunan sosial. Yayasan beroperasi di Desa Gadung, Kecamatan Driyorejo, Kabupaten Gresik, Jawa Timur, dan menaungi **Pondok Pesantren, SMP, dan SMA Tahfidzul Qur'an**.

## Visi

Menjadi yayasan Islam yang amanah dan profesional dalam menyalurkan donasi umat untuk kesejahteraan masyarakat dan kemajuan pendidikan agama.

## Misi

- Membagikan mushaf Al-Qur'an kepada santri & jamaah
- Memberikan santunan rutin kepada anak yatim & dhuafa
- Membangun & mengembangkan sarana ibadah serta pendidikan
- Mengelola wakaf tanah untuk pengembangan jangka panjang

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
- **Ketua**: Muhammad Lukman Hakim
- **Sekretaris**: Rendy Dwi Adi Putra
- **Bendahara**: Lailatul Hidayah
- **Bendahara**: Nilna Khumairo'

### Pengawas
- **Ketua**: Nanang Indrayana, S.E.

## Hadits Pengingat

> "Apabila anak Adam meninggal, terputus seluruh amalnya kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak shalih yang mendoakannya."
>
> — HR. Muslim
$tentang$,
  meta_description = 'Profil Yayasan Islam Al Muzayyin Gadung — Pondok Pesantren, SMP, SMA Tahfidzul Qur''an di Desa Gadung, Driyorejo, Gresik. Berbadan hukum SK Menkumham 2023.',
  updated_at = now()::text,
  updated_by = 'system'
WHERE slug = 'tentang';

-- ===== 3. UPDATE HALAMAN KONTAK =============================================

UPDATE public.donasi_pages SET
  content = $kontak$## Hubungi Kami

Kami terbuka untuk pertanyaan, kerjasama, dan kunjungan.

## Alamat Sekretariat

**Yayasan Islam Al Muzayyin Gadung**
Jl. Gadung 1, RT 003 RW 001
Desa Gadung, Kec. Driyorejo
Kabupaten Gresik 61177
Jawa Timur

## Penanggung Jawab

**Muhammad Lukman Hakim** — Ketua Pengurus

## Kontak Resmi

- **Email Umum**: info@yayasanislamalmuzayin.com
- **Email Donasi**: donasi@yayasanislamalmuzayin.com
- **WhatsApp**: +62 8XX-XXXX-XXXX *(silakan edit nomor aktif di /admin/pages)*

## Jam Operasional

- Senin – Jumat: 08.00 – 17.00 WIB
- Sabtu: 08.00 – 12.00 WIB
- Minggu & Hari Libur: Tutup

## Donasi via Transfer Manual

Selain donasi via website (Midtrans), Anda juga bisa transfer langsung ke rekening resmi yayasan:

**Bank Mandiri** (KCP Surabaya Pakuwon City)
- **No. Rekening**: `140-00-3993992-2`
- **Atas Nama**: Yayasan Islam Al Muzayyin Gadung

Setelah transfer, **konfirmasi ke email donasi@yayasanislamalmuzayin.com** dengan menyertakan nominal & tanggal transfer agar tercatat di laporan transparansi.

## Untuk Pertanyaan Donasi

Setiap donasi via website akan otomatis dapat tanda terima email. Bila tidak terkirim, hubungi `donasi@yayasanislamalmuzayin.com` dengan menyertakan **Order ID**.
$kontak$,
  meta_description = 'Kontak Yayasan Islam Al Muzayyin Gadung — alamat Desa Gadung Driyorejo Gresik, telepon, email, rekening Bank Mandiri.',
  updated_at = now()::text,
  updated_by = 'system'
WHERE slug = 'kontak';

-- ===== 4. INSERT HALAMAN LEGALITAS BARU ====================================

INSERT INTO public.donasi_pages
  (id, slug, title, content, meta_description, published, is_system, created_at, updated_at, updated_by)
VALUES
(gen_random_uuid()::text, 'legalitas', 'Legalitas',
 $legalitas$## Yayasan Berbadan Hukum

Yayasan Islam Al Muzayyin Gadung adalah lembaga sosial keagamaan yang **berbadan hukum sah** dan terdaftar di Kementerian Hukum dan HAM Republik Indonesia.

## Dokumen Legal

### 1. Akta Pendirian Yayasan

| | |
|---|---|
| **Nomor Akta** | 10 |
| **Tanggal** | 11 Oktober 2023 |
| **Notaris** | Roma Sukmawati, S.H., M.Kn. |
| **Tempat** | Kabupaten Gresik, Jawa Timur |

### 2. Pengesahan Menteri Hukum dan HAM

| | |
|---|---|
| **Nomor SK** | AHU-0017282.AH.01.04.Tahun 2023 |
| **Tanggal** | 18 Oktober 2023 |
| **Daftar Yayasan** | AHU-0024997.AH.01.12.Tahun 2023 |
| **Penerbit** | Direktur Jenderal Administrasi Hukum Umum, a.n. Menteri Hukum dan HAM RI |

### 3. Surat Keterangan Domisili

| | |
|---|---|
| **Nomor Surat** | 470/493/437.108.16/2023 |
| **Tanggal** | 9 Oktober 2023 |
| **Penerbit** | Kepala Desa Gadung, Kecamatan Driyorejo, Kabupaten Gresik |

### 4. Rekening Resmi Yayasan

Untuk transfer donasi manual atau verifikasi keabsahan rekening:

| | |
|---|---|
| **Bank** | Bank Mandiri |
| **KCP** | Surabaya Pakuwon City |
| **No. Rekening** | `140-00-3993992-2` |
| **Atas Nama** | Yayasan Islam Al Muzayyin Gadung |

⚠️ **Hati-hati penipuan**: Pastikan transfer hanya ke rekening atas nama Yayasan di atas. Jika ragu, hubungi langsung pengurus melalui kanal resmi di [Kontak](/kontak).

## Struktur Pengurus

### Pembina
- Mardjuki — Ketua
- Moch. Arief Jaka Samudra — Anggota
- Sofwan — Anggota

### Pengurus
- Muhammad Lukman Hakim — Ketua
- Rendy Dwi Adi Putra — Sekretaris
- Lailatul Hidayah — Bendahara
- Nilna Khumairo' — Bendahara

### Pengawas
- Nanang Indrayana, S.E. — Ketua

## Verifikasi Mandiri

Anda dapat memverifikasi keabsahan badan hukum yayasan ini melalui sistem **AHU Online** Kementerian Hukum dan HAM:

🔗 [https://ahu.go.id](https://ahu.go.id) — cari "Yayasan Islam Al Muzayyin Gadung" atau dengan nomor SK `AHU-0017282.AH.01.04.Tahun 2023`.

## PUB (Pengumpulan Uang dan Barang)

*Surat izin Pengumpulan Uang dan Barang dari Kemensos RI sedang dalam proses pengurusan untuk donasi publik skala lebih luas.*

## Pelaporan Transparansi

Setiap donasi yang masuk dan tersalurkan dipublikasikan secara transparan di halaman [Transparansi](/transparansi).

— Yayasan Islam Al Muzayyin Gadung
$legalitas$,
 'Dokumen legalitas Yayasan Islam Al Muzayyin Gadung — Akta Notaris, SK Menkumham, Surat Domisili, dan rekening resmi.',
 TRUE, TRUE, now()::text, now()::text, 'system')
ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, meta_description = EXCLUDED.meta_description, updated_at = now()::text;

SELECT 'Migration 004 applied — yayasan data updated.' AS message;
