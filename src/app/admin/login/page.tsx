import LoginForm from "./LoginForm";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md card">
        <div className="text-center mb-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary text-white text-2xl">
            ﷽
          </div>
          <h1 className="mt-4 text-2xl font-bold">Login Admin</h1>
          <p className="mt-1 text-sm text-slate-600">
            Yayasan Islam Al Muzayyin Gadung
          </p>
        </div>

        {error === "not_admin" && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            Email Anda tidak terdaftar sebagai admin. Hubungi pengurus untuk meminta akses.
          </div>
        )}

        {error === "auth_failed" && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            Verifikasi link gagal atau kedaluwarsa. Coba lagi.
          </div>
        )}

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-500">
          Akun admin dibuat oleh pengurus via Supabase Dashboard.
        </p>
      </div>
    </div>
  );
}
