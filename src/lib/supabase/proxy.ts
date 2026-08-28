import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDevBypass } from "@/lib/dev-bypass";
import { supabaseEnv } from "@/lib/supabase/env";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export async function updateSession(request: NextRequest) {
  if (isDevBypass()) {
    const path = request.nextUrl.pathname;
    if (path === "/login" || path === "/signup" || path === "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next({ request });
  }

  const env = supabaseEnv();
  if (!env) {
    return NextResponse.next({ request });
  }
  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = env;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        if (headers) {
          Object.entries(headers).forEach(([headerName, headerValue]) => {
            supabaseResponse.headers.set(headerName, headerValue);
          });
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const path = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_PATHS.has(path) || path.startsWith("/auth/") || path.startsWith("/login") ||
    path.startsWith("/signup");

  if (!userId && !isPublic) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    const redirect = NextResponse.redirect(login);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  if (userId && (path === "/login" || path === "/signup")) {
    const redirect = NextResponse.redirect(new URL("/home", request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  return supabaseResponse;
}
