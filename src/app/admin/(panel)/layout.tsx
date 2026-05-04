import { getAdminSession } from "@/lib/admin-auth";
import PanelShell from "./PanelShell";

// Admin pages selalu dinamis (auth-gated), tidak perlu prerender at build time.
// Ini juga mencegah build gagal kalau env vars belum di-set.
export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/donations", label: "Donasi", icon: "💰" },
  { href: "/admin/campaigns", label: "Program", icon: "🗂️" },
  { href: "/admin/finance", label: "Keuangan", icon: "📊" },
  { href: "/admin/reports", label: "Laporan", icon: "📋" },
  { href: "/admin/popups", label: "Popup Manual", icon: "🔔" },
  { href: "/admin/galleries", label: "Galeri Foto", icon: "🖼️" },
  { href: "/admin/pages", label: "Halaman", icon: "📄" },
  { href: "/admin/users", label: "Admin Users", icon: "👥" },
  { href: "/admin/logs", label: "Webhook Logs", icon: "📜" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminSession();
  return (
    <PanelShell user={user} navItems={navItems}>
      {children}
    </PanelShell>
  );
}
