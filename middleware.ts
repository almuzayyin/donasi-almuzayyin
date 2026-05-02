import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/admin-allowlist";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const c of toSet) {
          request.cookies.set(c.name, c.value);
        }
        response = NextResponse.next({ request });
        for (const c of toSet) {
          response.cookies.set(c.name, c.value, c.options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowed = user?.email ? await isAdminEmail(user.email) : false;

  if (!user || !allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    if (user && !allowed) url.searchParams.set("error", "not_admin");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
