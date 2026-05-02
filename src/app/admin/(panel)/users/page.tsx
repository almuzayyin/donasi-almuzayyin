import { requireAdmin } from "@/lib/admin-auth";
import { listAdmins } from "@/lib/admin-allowlist";
import AddUserForm from "./AddUserForm";
import RemoveUserButton from "./RemoveUserButton";

export default async function UsersPage() {
  const me = await requireAdmin();
  const admins = await listAdmins();

  const envAllowlist = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Users</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Kelola siapa saja yang boleh akses panel admin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-bold text-lg mb-4">Daftar Admin (Database)</h2>
          {admins.length === 0 ? (
            <p className="text-slate-500 text-sm">Belum ada admin di database.</p>
          ) : (
            <ul className="divide-y divide-slate-100 -mx-4 sm:-mx-6">
              {admins.map((a) => {
                const isMe = a.email === me.email;
                return (
                  <li key={a.id} className="px-4 sm:px-6 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm break-all">{a.email}</span>
                        {isMe && <span className="badge bg-primary/10 text-primary">Anda</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {a.full_name ?? "Tanpa nama"} · ditambahkan{" "}
                        {new Date(a.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isMe ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <RemoveUserButton id={a.id} email={a.email} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-lg mb-4">Tambah Admin</h2>
          <AddUserForm />
        </div>
      </div>

      {envAllowlist.length > 0 && (
        <div className="mt-5 sm:mt-6 card bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-sm mb-2">Allowlist dari Environment</h3>
          <p className="text-xs text-slate-600 mb-3">
            Email berikut juga otomatis admin (dari <code className="bg-white px-1 rounded">ADMIN_EMAILS</code> di <code className="bg-white px-1 rounded">.env.local</code>).
            Tidak bisa dihapus dari halaman ini — edit env file untuk menghapus.
          </p>
          <ul className="text-sm space-y-1">
            {envAllowlist.map((e) => (
              <li key={e} className="font-mono text-xs">{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
