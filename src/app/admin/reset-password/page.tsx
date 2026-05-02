import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md card">
        <div className="text-center mb-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-primary text-white text-2xl">
            🔑
          </div>
          <h1 className="mt-4 text-2xl font-bold">Set Password Baru</h1>
          <p className="mt-1 text-sm text-slate-600">
            Yayasan Islam Al Muzayyin Gadung
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
