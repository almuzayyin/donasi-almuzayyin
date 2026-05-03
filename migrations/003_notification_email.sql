-- =============================================================================
-- MIGRATION 003: Notification Email Setting
-- =============================================================================
-- Tambah setting notification_email ke donasi_settings.
-- Email yang dimasukkan akan menerima notifikasi setiap donasi paid masuk.
-- =============================================================================

INSERT INTO public.donasi_settings (key, value, description, is_public, updated_at, updated_by)
VALUES (
  'notification_email',
  'info@yayasanislamalmuzayin.com',
  'Email yang menerima notifikasi setiap donasi paid masuk',
  FALSE,
  now()::text,
  'system'
)
ON CONFLICT (key) DO NOTHING;

SELECT 'Migration 003 applied. Edit notification_email di /admin/settings.' AS message;
