# Donasi

Website donasi uang dan wakaf mushaf Al-Qur'an dengan payment gateway **Midtrans**. Lengkap dengan landing page, form donasi, webhook handler, dan MCP server untuk integrasi AI assistant.

## Stack

- **Next.js 15** (App Router) — landing + form + API routes
- **SQLite (better-sqlite3)** — DB lokal (portable ke Postgres/Supabase)
- **Midtrans Snap** — payment gateway (sandbox & production)
- **Tailwind CSS** — styling
- **MCP Server** — 12 tools untuk operasi donasi via Claude/AI

## Struktur

```
donasi/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Landing page
│   │   ├── donasi/                 # Form donasi
│   │   ├── sukses/, gagal/         # Halaman hasil pembayaran
│   │   └── api/
│   │       ├── donate/             # POST: buat donasi + Midtrans Snap
│   │       ├── donations/[orderId] # GET: cek status donasi
│   │       └── midtrans/webhook/   # POST: notifikasi pembayaran
│   ├── lib/                        # Shared business logic
│   │   ├── db.ts                   # SQLite connection (singleton)
│   │   ├── storage.ts              # Repository pattern
│   │   ├── donations.ts            # Use cases (createDonation, dst)
│   │   ├── payment.ts              # Midtrans client + signature verify
│   │   ├── email.ts                # Receipt email (console.log lokal)
│   │   └── types.ts
│   └── mcp/server.ts               # MCP server entry
├── migrations/001_init.sql         # Schema (SQLite & Postgres-compatible)
├── scripts/
│   ├── migrate.ts                  # Apply migrations
│   └── seed.ts                     # Seed campaigns demo
└── data/donasi.sqlite              # DB file (gitignored)
```

## Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Setup env
cp .env.example .env
# Isi MIDTRANS_SERVER_KEY & MIDTRANS_CLIENT_KEY dari sandbox.midtrans.com

# 3. Migrate database & seed contoh campaign
npm run db:migrate
npm run db:seed

# 4. Start dev server
npm run dev
# -> http://localhost:3000
```

## Webhook Lokal (Midtrans → localhost)

Midtrans butuh URL public untuk kirim webhook. Pakai `ngrok` atau `cloudflared`:

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000
# Copy URL https → daftarkan di Midtrans dashboard:
# Settings > Configuration > Payment Notification URL:
# https://abc123.ngrok.io/api/midtrans/webhook
```

## Flow Donasi (E2E)

1. Pengunjung buka `/` → pilih campaign atau klik "Donasi Sekarang"
2. Buka `/donasi` → isi form (jenis, nominal, data donatur)
3. Submit → POST `/api/donate`
   - Buat record `donations` dengan status `pending`
   - Panggil Midtrans Snap → dapat `token` + `redirect_url`
4. Frontend buka Snap popup → user bayar (VA, e-wallet, kartu, QRIS)
5. Midtrans kirim webhook → POST `/api/midtrans/webhook`
   - Verifikasi signature SHA-512
   - Update status donasi (paid/expired/cancelled)
   - Update progress campaign
   - Kirim email tanda terima
6. User di-redirect ke `/sukses?order_id=...`

## MCP Server

```bash
# Build
npm run mcp:build

# Pakai di Claude Code config:
# {
#   "mcpServers": {
#     "donasi": {
#       "command": "node",
#       "args": ["C:/Users/Kidolabs/Projects/donasi/dist-mcp/mcp/server.js"],
#       "env": { "MIDTRANS_SERVER_KEY": "...", "DB_PATH": "..." }
#     }
#   }
# }
```

12 tools tersedia: `create_money_donation`, `create_mushaf_donation`,
`list_donations`, `get_donation`, `check_payment_status`, `cancel_payment`,
`handle_payment_webhook`, `create_campaign`, `list_campaigns`,
`get_campaign_progress`, `get_donation_stats`, `generate_receipt`.

## Migrasi ke Production (Supabase)

Saat siap deploy:

1. Buat project Supabase, jalankan `migrations/001_init.sql` di SQL editor
   (kompatibel — hanya perlu ganti `INTEGER` → `BIGINT` untuk `payment_logs.id` bila mau pakai BIGSERIAL)
2. Ganti `src/lib/db.ts` & `storage.ts` ke `@supabase/supabase-js` client
3. Set env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. Set Midtrans `MIDTRANS_IS_PRODUCTION=true` + production keys
5. Daftarkan webhook URL production di Midtrans dashboard
6. Aktifkan Resend dan set `RESEND_API_KEY` untuk email production

## Catatan

- `data/`, `.env`, dan `node_modules/` di-gitignore
- `npm run typecheck` untuk validasi TypeScript
- Semua nominal dalam **satuan rupiah utuh** (Rp 1.000 → `1000`)
