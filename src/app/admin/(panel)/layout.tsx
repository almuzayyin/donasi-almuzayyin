import { getAdminSession } from "@/lib/admin-auth";
import PanelShell from "./PanelShell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/donations", label: "Donasi", icon: "💰" },
  { href: "/admin/campaigns", label: "Program", icon: "🗂️" },
  { href: "/admin/reports", label: "Laporan", icon: "📋" },
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
