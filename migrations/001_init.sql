-- Donasi schema. Compatible dengan SQLite (lokal) dan Postgres (produksi).
-- Untuk Postgres, ganti INTEGER PRIMARY KEY AUTOINCREMENT -> BIGSERIAL
-- dan TEXT -> TEXT (sama).

CREATE TABLE IF NOT EXISTS campaigns (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('uang', 'mushaf')),
  target_amount    INTEGER NOT NULL,
  collected_amount INTEGER NOT NULL DEFAULT 0,
  donor_count      INTEGER NOT NULL DEFAULT 0,
  start_date       TEXT NOT NULL,
  end_date         TEXT,
  active           INTEGER NOT NULL DEFAULT 1,
  cover_image      TEXT,
  created_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);

CREATE TABLE IF NOT EXISTS donations (
  id                TEXT PRIMARY KEY,
  order_id          TEXT UNIQUE NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('uang', 'mushaf')),
  campaign_id       TEXT REFERENCES campaigns(id),
  donor_name        TEXT NOT NULL,
  donor_email       TEXT NOT NULL,
  donor_phone       TEXT,
  donor_anonymous   INTEGER NOT NULL DEFAULT 0,
  amount            INTEGER NOT NULL,
  quantity          INTEGER,
  unit_price        INTEGER,
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
  updated_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);

CREATE TABLE IF NOT EXISTS payment_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         TEXT NOT NULL,
  signature_valid INTEGER,
  created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);
