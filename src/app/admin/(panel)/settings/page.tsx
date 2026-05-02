import { requireAdmin } from "@/lib/admin-auth";

export default async function SettingsPage() {
  const user = await requireAdmin();

  const items: { label: string; value: string; secret?: boolean }[] = [
    { label: "Login sebagai", value: user.email },
    { label: "Admin Email Allowlist", value: process.env.ADMIN_EMAILS || "(belum di-set)" },
    { label: "Mushaf Unit Price", value: `Rp ${Number(process.env.MUSHAF_UNIT_PRICE || 85000).toLocaleString("id-ID")}` },
    { label: "Supabase URL", value: process.env.SUPABASE_URL || "-" },
    { label: "Service Role Key", value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Midtrans Mode", value: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "Production" : "Sandbox" },
    { label: "Midtrans Server Key", value: process.env.MIDTRANS_SERVER_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Midtrans Client Key", value: process.env.MIDTRANS_CLIENT_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Webhook Notification URL", value: process.env.PAYMENT_NOTIFICATION_URL || "(perlu ngrok untuk lokal)" },
    { label: "Email Provider (Resend)", value: process.env.RESEND_API_KEY ? "✓ Configured" : "Console log (dev only)", secret: true },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          Konfigurasi runtime (read-only, edit via <code className="text-xs bg-slate-100 px-1 rounded">.env.local</code>)
        </p>
      </div>

      <div className="card">
        <dl className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.label} className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 text-sm">
              <dt className="font-medium text-slate-700">{item.label}</dt>
              <dd className={`break-words ${item.secret ? "font-mono text-xs" : ""}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 card bg-amber-50 border-amber-200">
        <h2 className="font-bold mb-2">👥 Manajemen Admin</h2>
        <p className="text-sm text-slate-700 mb-3">
          Tambah, lihat, dan hapus admin langsung dari halaman{" "}
          <a href="/admin/users" className="text-primary underline font-semibold">
            Admin Users
          </a>
          . Tidak perlu lagi buka Supabase Dashboard atau edit env file.
        </p>
        <p className="text-xs text-slate-600">
          Email di <code className="bg-white px-1 rounded">ADMIN_EMAILS</code> tetap berlaku
          sebagai bootstrap allowlist (tidak bisa dihapus dari panel — edit env file kalau perlu).
        </p>
      </div>
    </div>
  );
}
