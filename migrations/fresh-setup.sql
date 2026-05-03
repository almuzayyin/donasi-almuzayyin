-- =============================================================================
-- FRESH SETUP — Yayasan Islam Al Muzayyin Gadung Donation Platform
-- =============================================================================
-- Jalankan ini SEKALI di Supabase SQL Editor project baru.
-- Setelah run sukses, buat admin user manual via Authentication → Users → Add user.
-- =============================================================================

-- ===== 1. TABLES =============================================================

CREATE TABLE IF NOT EXISTS public.donasi_campaigns (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('uang', 'mushaf')),
  target_amount    BIGINT NOT NULL,
  collected_amount BIGINT NOT NULL DEFAULT 0,
  donor_count      INTEGER NOT NULL DEFAULT 0,
  start_date       TEXT NOT NULL,
  end_date         TEXT,
  active           BOOLEAN NOT NULL DEFAULT true,
  cover_image      TEXT,
  created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donasi_campaigns_active ON public.donasi_campaigns(active);
CREATE INDEX IF NOT EXISTS idx_donasi_campaigns_type ON public.donasi_campaigns(type);

CREATE TABLE IF NOT EXISTS public.donasi_donations (
  id                TEXT PRIMARY KEY,
  order_id          TEXT UNIQUE NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('uang','mushaf')),
  campaign_id       TEXT REFERENCES public.donasi_campaigns(id),
  donor_name        TEXT NOT NULL,
  donor_email       TEXT NOT NULL,
  donor_phone       TEXT,
  donor_anonymous   BOOLEAN NOT NULL DEFAULT false,
  amount            BIGINT NOT NULL,
  quantity          INTEGER,
  unit_price        BIGINT,
  recipient_name    TEXT,
  recipient_address TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','expired','cancelled','failed','refunded')),
  payment_url       TEXT,
  payment_token     TEXT,
  payment_method    TEXT,
  paid_at           TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  proof_url         TEXT,
  is_manual         BOOLEAN NOT NULL DEFAULT false,
  notes             TEXT
);
CREATE INDEX IF NOT EXISTS idx_donasi_donations_status ON public.donasi_donations(status);
CREATE INDEX IF NOT EXISTS idx_donasi_donations_campaign ON public.donasi_donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donasi_donations_email ON public.donasi_donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donasi_donations_created ON public.donasi_donations(created_at);

CREATE TABLE IF NOT EXISTS public.donasi_payment_logs (
  id              BIGSERIAL PRIMARY KEY,
  order_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL,
  signature_valid BOOLEAN,
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donasi_payment_logs_order ON public.donasi_payment_logs(order_id);

CREATE TABLE IF NOT EXISTS public.donasi_admins (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  created_at  TEXT NOT NULL,
  created_by  TEXT
);
CREATE INDEX IF NOT EXISTS idx_donasi_admins_email ON public.donasi_admins(email);

CREATE TABLE IF NOT EXISTS public.donasi_reports (
  id            TEXT PRIMARY KEY,
  campaign_id   TEXT REFERENCES public.donasi_campaigns(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  amount_used   BIGINT,
  quantity      INTEGER,
  report_date   TEXT NOT NULL,
  location      TEXT,
  recipient     TEXT,
  photos        JSONB DEFAULT '[]'::jsonb,
  documents     JSONB DEFAULT '[]'::jsonb,
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TEXT NOT NULL,
  created_by    TEXT
);
CREATE INDEX IF NOT EXISTS idx_donasi_reports_campaign ON public.donasi_reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donasi_reports_published ON public.donasi_reports(published);
CREATE INDEX IF NOT EXISTS idx_donasi_reports_date ON public.donasi_reports(report_date DESC);

CREATE TABLE IF NOT EXISTS public.donasi_report_expenses (
  id          TEXT PRIMARY KEY,
  report_id   TEXT NOT NULL REFERENCES public.donasi_reports(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  description TEXT,
  amount      BIGINT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donasi_report_expenses_report ON public.donasi_report_expenses(report_id);

CREATE TABLE IF NOT EXISTS public.donasi_pages (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  meta_description TEXT,
  published        BOOLEAN NOT NULL DEFAULT TRUE,
  is_system        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  updated_by       TEXT
);
CREATE INDEX IF NOT EXISTS idx_donasi_pages_slug ON public.donasi_pages(slug);

CREATE TABLE IF NOT EXISTS public.donasi_popup_messages (
  id              TEXT PRIMARY KEY,
  donor_name      TEXT NOT NULL,
  donor_location  TEXT,
  amount          BIGINT,
  campaign_id     TEXT REFERENCES public.donasi_campaigns(id) ON DELETE SET NULL,
  type            TEXT NOT NULL DEFAULT 'uang' CHECK (type IN ('uang', 'mushaf')),
  custom_message  TEXT,
  display_at      TEXT NOT NULL,
  show_until      TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TEXT NOT NULL,
  created_by      TEXT
);
CREATE INDEX IF NOT EXISTS idx_donasi_popup_active ON public.donasi_popup_messages(active, show_until);

-- ===== 2. ROW LEVEL SECURITY ================================================

ALTER TABLE public.donasi_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_report_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donasi_popup_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "donasi_campaigns_public_read" ON public.donasi_campaigns;
CREATE POLICY "donasi_campaigns_public_read" ON public.donasi_campaigns
  FOR SELECT USING (active = TRUE);

DROP POLICY IF EXISTS "donasi_reports_public_read" ON public.donasi_reports;
CREATE POLICY "donasi_reports_public_read" ON public.donasi_reports
  FOR SELECT USING (published = TRUE);

DROP POLICY IF EXISTS "report_expenses_public_read" ON public.donasi_report_expenses;
CREATE POLICY "report_expenses_public_read" ON public.donasi_report_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.donasi_reports r
      WHERE r.id = donasi_report_expenses.report_id AND r.published = TRUE
    )
  );

DROP POLICY IF EXISTS "donasi_pages_public_read" ON public.donasi_pages;
CREATE POLICY "donasi_pages_public_read" ON public.donasi_pages
  FOR SELECT USING (published = TRUE);

DROP POLICY IF EXISTS "donasi_popup_public_read" ON public.donasi_popup_messages;
CREATE POLICY "donasi_popup_public_read" ON public.donasi_popup_messages
  FOR SELECT USING (
    active = TRUE
    AND (show_until IS NULL OR show_until > now()::text)
  );

-- Tabel sensitif: revoke anon SELECT (service_role only)
REVOKE SELECT ON public.donasi_admins FROM anon, authenticated;
REVOKE SELECT ON public.donasi_donations FROM anon, authenticated;
REVOKE SELECT ON public.donasi_payment_logs FROM anon, authenticated;

-- ===== 3. STORAGE BUCKETS ===================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('donasi-covers', 'donasi-covers', TRUE, 5242880,
   ARRAY['image/png','image/jpeg','image/webp','image/gif']::text[]),
  ('donasi-reports', 'donasi-reports', TRUE, 10485760,
   ARRAY['image/png','image/jpeg','image/webp','image/gif','application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies — auth role bisa write, public bisa read via signed URL
DROP POLICY IF EXISTS "donasi_covers_admin_insert" ON storage.objects;
CREATE POLICY "donasi_covers_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'donasi-covers' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "donasi_covers_admin_update" ON storage.objects;
CREATE POLICY "donasi_covers_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'donasi-covers' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "donasi_covers_admin_delete" ON storage.objects;
CREATE POLICY "donasi_covers_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'donasi-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "donasi_reports_admin_write" ON storage.objects;
CREATE POLICY "donasi_reports_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'donasi-reports' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "donasi_reports_admin_update" ON storage.objects;
CREATE POLICY "donasi_reports_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'donasi-reports' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "donasi_reports_admin_delete" ON storage.objects;
CREATE POLICY "donasi_reports_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'donasi-reports' AND auth.role() = 'authenticated');

-- ===== 4. SEED DATA — 4 CAMPAIGN DEFAULT ====================================

INSERT INTO public.donasi_campaigns
  (id, slug, title, description, type, target_amount, collected_amount, donor_count,
   start_date, end_date, active, cover_image, created_at)
VALUES
(gen_random_uuid()::text, 'waqof-al-quran',
 'Waqof Al-Qur''an',
 'Wakafkan mushaf Al-Qur''an untuk santri dan jamaah Yayasan Islam Al Muzayyin Gadung. Setiap mushaf yang Anda wakafkan akan dibaca, dipelajari, dan menjadi amal jariyah yang tak terputus.',
 'mushaf', 85000000, 0, 0, now()::text, NULL, TRUE, NULL, now()::text),
(gen_random_uuid()::text, 'santunan-yatim-piatu',
 'Santunan Yatim Piatu',
 'Bantu meringankan beban anak yatim dan piatu di lingkungan Yayasan Al Muzayyin. Donasi Anda dipakai untuk biaya pendidikan, kebutuhan harian, dan santunan rutin bulanan.',
 'uang', 100000000, 0, 0, now()::text, NULL, TRUE, NULL, now()::text),
(gen_random_uuid()::text, 'donasi-pembangunan',
 'Donasi Pembangunan',
 'Dukung pembangunan dan pengembangan sarana ibadah serta pendidikan Yayasan Islam Al Muzayyin Gadung — masjid, ruang belajar, dan fasilitas pendukung lainnya.',
 'uang', 500000000, 0, 0, now()::text, NULL, TRUE, NULL, now()::text),
(gen_random_uuid()::text, 'waqof-tanah',
 'Waqof Tanah',
 'Wakaf tanah untuk perluasan area Yayasan Al Muzayyin — kompleks pendidikan, masjid, dan asrama santri. Wakaf tanah adalah amal jariyah dengan pahala yang terus mengalir selama tanah itu dimanfaatkan.',
 'uang', 1000000000, 0, 0, now()::text, NULL, TRUE, NULL, now()::text)
ON CONFLICT (slug) DO NOTHING;

-- ===== 5. SEED DATA — 5 LEGAL PAGES ==========================================

INSERT INTO public.donasi_pages
  (id, slug, title, content, meta_description, published, is_system, created_at, updated_at, updated_by)
VALUES
(gen_random_uuid()::text, 'tentang', 'Tentang Yayasan',
 E'## Profil Yayasan\n\nYayasan Islam Al Muzayyin Gadung adalah lembaga sosial keagamaan yang berkhidmat dalam bidang dakwah, pendidikan, dan santunan sosial.\n\n## Visi\n\nMenjadi yayasan Islam yang amanah dan profesional dalam menyalurkan donasi umat.\n\n## Misi\n\n- Membagikan mushaf Al-Qur''an\n- Memberikan santunan rutin yatim dhuafa\n- Membangun sarana ibadah dan pendidikan\n- Mengelola wakaf tanah\n\n## Legalitas\n\n- **Akta Notaris**: [Edit di /admin/pages]\n- **SK Menkumham**: [Edit di /admin/pages]\n- **NPWP**: [Edit di /admin/pages]\n- **Surat PUB Kemensos**: [Edit di /admin/pages]',
 'Profil Yayasan Islam Al Muzayyin Gadung — visi, misi, legalitas.',
 TRUE, TRUE, now()::text, now()::text, 'system'),

(gen_random_uuid()::text, 'kontak', 'Kontak Kami',
 E'## Hubungi Kami\n\n## Alamat Sekretariat\n\n**Yayasan Islam Al Muzayyin**\n[Edit alamat lengkap di /admin/pages]\n\n## Kontak Resmi\n\n- **Telepon / WhatsApp**: [+62 8XX-XXXX-XXXX]\n- **Email**: info@al-muzayyin.org\n\n## Jam Operasional\n\n- Senin – Jumat: 08.00 – 17.00 WIB\n- Sabtu: 08.00 – 12.00 WIB\n\n## Rekening Donasi\n\n- **Bank**: [Nama Bank]\n- **No. Rekening**: [Nomor]\n- **Atas Nama**: Yayasan Islam Al Muzayyin',
 'Kontak Yayasan Islam Al Muzayyin Gadung.',
 TRUE, TRUE, now()::text, now()::text, 'system'),

(gen_random_uuid()::text, 'kebijakan-privasi', 'Kebijakan Privasi',
 E'**Berlaku efektif:** 1 Mei 2026\n\n## 1. Pendahuluan\n\nYayasan Islam Al Muzayyin Gadung menghormati privasi Anda.\n\n## 2. Data yang Kami Kumpulkan\n\n- Nama, email, nomor telepon (opsional)\n- Nominal donasi, program, pesan\n- Metode pembayaran (data kartu TIDAK disimpan — diproses Midtrans)\n\n## 3. Penggunaan Data\n\n- Memproses transaksi\n- Mengirim tanda terima\n- Laporan transparansi\n\nKami **TIDAK** menjual data Anda.\n\n## 4. Berbagi Data\n\nHanya dengan: Midtrans (payment), Supabase (database), penegak hukum jika diwajibkan.\n\n## 5. Hak Anda\n\n- Salinan data\n- Koreksi/penghapusan\n- Tarik persetujuan\n\nKontak: **donasi@al-muzayyin.org**',
 'Kebijakan privasi platform donasi Yayasan Al Muzayyin.',
 TRUE, TRUE, now()::text, now()::text, 'system'),

(gen_random_uuid()::text, 'syarat-ketentuan', 'Syarat & Ketentuan',
 E'**Berlaku efektif:** 1 Mei 2026\n\n## 1. Penerimaan\n\nDengan menggunakan platform ini, Anda setuju Syarat & Ketentuan ini.\n\n## 2. Cara Berdonasi\n\n- Pilih program → isi data → pilih metode pembayaran\n- Diproses via Midtrans\n- Tanda terima dikirim email\n\n## 3. Penggunaan Dana\n\n- 100% donasi (setelah biaya gateway) untuk program dipilih\n- Laporan publik di [/transparansi](/transparansi)\n\n## 4. Hukum\n\nDiatur hukum Republik Indonesia.\n\nKontak: **donasi@al-muzayyin.org**',
 'Syarat dan ketentuan platform donasi.',
 TRUE, TRUE, now()::text, now()::text, 'system'),

(gen_random_uuid()::text, 'pengembalian-dana', 'Kebijakan Pengembalian Dana',
 E'**Berlaku efektif:** 1 Mei 2026\n\n## 1. Prinsip Umum\n\nDonasi bersifat final dan tidak dapat dikembalikan setelah pembayaran sukses dan dana tersalurkan.\n\n## 2. Pengecualian\n\nRefund dapat diproses jika:\n- Donasi double charge (kesalahan teknis)\n- Diajukan dalam 24 jam, dana belum tersalurkan\n- Force majeure\n\n## 3. Cara Mengajukan\n\nKirim email ke **donasi@al-muzayyin.org** dengan Order ID + alasan. Respon 3 hari kerja.\n\n## 4. Proses\n\n- Kartu kredit: 1-14 hari kerja\n- VA/E-wallet/QRIS: 1-5 hari kerja\n- Biaya gateway tidak dikembalikan',
 'Kebijakan pengembalian dana donasi.',
 TRUE, TRUE, now()::text, now()::text, 'system')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- SELESAI
-- =============================================================================
SELECT 'Setup complete. Next steps:' as message
UNION ALL SELECT '1. Authentication → Users → Add user (email yayasan + password)'
UNION ALL SELECT '2. INSERT INTO donasi_admins email tersebut (lihat baris contoh di bawah)'
UNION ALL SELECT '3. Authentication → URL Configuration → Site URL = https://YOUR_VERCEL_DOMAIN'
UNION ALL SELECT '4. Settings → API → copy URL + anon key + service role key'
UNION ALL SELECT '5. Update Vercel env vars dengan keys baru'
UNION ALL SELECT '6. Redeploy';

-- Setelah create user di Authentication → Users, jalankan query ini
-- (ganti EMAIL_ANDA dengan email yang baru saja dibuat):
-- INSERT INTO public.donasi_admins (id, email, full_name, created_at, created_by)
-- VALUES (gen_random_uuid()::text, 'EMAIL_ANDA@example.com', 'Admin Utama',
--         now()::text, 'system');
