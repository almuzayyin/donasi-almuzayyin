import { redirect } from "next/navigation";
import { createServerClient } from "./supabase-server.js";
import { isAdminEmail } from "./admin-allowlist.js";

export interface AdminUser {
  id: string;
  email: string;
}

export async function getAdminSession(): Promise<AdminUser | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !data.user.email) return null;
  if (!(await isAdminEmail(data.user.email))) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");
  return user;
}

export { isAdminEmail };
