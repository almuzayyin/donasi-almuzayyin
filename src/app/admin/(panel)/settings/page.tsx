import { requireAdmin } from "@/lib/admin-auth";
import { settingsStore } from "@lib/storage";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const user = await requireAdmin();
  const settings = await settingsStore.list();

  // Runtime config (read-only, not editable from UI)
  const runtimeInfo: { label: string; value: string; secret?: boolean }[] = [
    { label: "Login sebagai", value: user.email },
    { label: "Admin Email Allowlist", value: process.env.ADMIN_EMAILS || "(belum di-set)" },
    { label: "Database URL", value: process.env.SUPABASE_URL || "-" },
    { label: "Service Role Key", value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Midtrans Mode", value: process.env.MIDTRANS_IS_PRODUCTION === "true" ? "Production" : "Sandbox" },
    { label: "Midtrans Server Key", value: process.env.MIDTRANS_SERVER_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Midtrans Client Key", value: process.env.MIDTRANS_CLIENT_KEY ? "✓ Configured" : "✗ Belum di-set", secret: true },
    { label: "Webhook Notification URL", value: process.env.PAYMENT_NOTIFICATION_URL || "(perlu ngrok untuk lokal)" },
    { label: "Email Provider (Resend)", value: process.env.RESEND_API_KEY ? "✓ Configured" : "Console log (dev only)", secret: true },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-5 sm:mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">
          Konfigurasi yang bisa diubah dari panel & info runtime read-only.
        </p>
      </div>

      {/* Editable settings dari DB */}
      <div className="card mb-6">
        <h2 className="font-bold text-lg mb-1">Konfigurasi Aplikasi</h2>
        <p className="text-sm text-slate-600 mb-4">
          Setting di sini disimpan di database dan langsung berlaku tanpa redeploy.
        </p>
        <SettingsForm initial={settings} />
      </div>

      {/* Runtime info — read-only */}
      <div className="card">
        <h2 className="font-bold text-lg mb-1">Runtime Info (Read-only)</h2>
        <p className="text-sm text-slate-600 mb-4">
          Konfigurasi server-side (env vars). Edit via Vercel dashboard untuk produksi atau{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">.env.local</code> untuk local dev.
        </p>
        <dl className="divide-y divide-slate-100">
          {runtimeInfo.map((item) => (
            <div key={item.label} className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-3 text-sm">
              <dt className="font-medium text-slate-700">{item.label}</dt>
              <dd className={`break-words ${item.secret ? "font-mono text-xs" : ""}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 card bg-amber-50 border-amber-200">
        <h2 className="font-bold mb-2">👥 Manajemen Admin</h2>
        <p className="text-sm text-slate-700">
          Tambah, lihat, dan hapus admin di halaman{" "}
          <a href="/admin/users" className="text-primary underline font-semibold">
            Admin Users
          </a>
          .
        </p>
      </div>
    </div>
  );
}
