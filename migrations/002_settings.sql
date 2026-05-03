-- =============================================================================
-- MIGRATION 002: Settings Table
-- =============================================================================
-- Jalankan ini di SQL Editor Supabase yayasan kalau Anda sudah apply
-- fresh-setup.sql versi LAMA (sebelum settings dimasukkan ke fresh-setup).
-- Kalau apply fresh-setup.sql versi terbaru, tidak perlu jalankan ini.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.donasi_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT
);

ALTER TABLE public.donasi_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donasi_settings_public_read" ON public.donasi_settings;
CREATE POLICY "donasi_settings_public_read" ON public.donasi_settings
  FOR SELECT USING (is_public = TRUE);

INSERT INTO public.donasi_settings (key, value, description, is_public, updated_at, updated_by)
VALUES
  ('mushaf_unit_price', '85000', 'Harga satuan mushaf Al-Qur''an dalam IDR (untuk wakaf mushaf)', TRUE, now()::text, 'system'),
  ('yayasan_name', 'Yayasan Islam Al Muzayyin Gadung', 'Nama lengkap yayasan untuk display & email', TRUE, now()::text, 'system'),
  ('yayasan_short_name', 'Al Muzayyin', 'Nama pendek yayasan', TRUE, now()::text, 'system'),
  ('contact_email', 'donasi@al-muzayyin.org', 'Email resmi yayasan untuk donatur', TRUE, now()::text, 'system'),
  ('contact_phone', '', 'Nomor WhatsApp/telepon yayasan', TRUE, now()::text, 'system')
ON CONFLICT (key) DO NOTHING;

SELECT 'Migration 002 (settings) applied. Sekarang Mushaf price bisa diedit di /admin/settings' AS message;
