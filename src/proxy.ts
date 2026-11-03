import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/utils";

const PROTECTED_PREFIXES = ["/library", "/collections", "/account", "/prompts"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) return response;

  const pendingCookies: {
    name: string;
    value: string;
    options?: Parameters<typeof response.cookies.set>[2];
  }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet);
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    redirectUrl.pathname = next;
    redirectUrl.search = "";
    return applyCookies(NextResponse.redirect(redirectUrl), pendingCookies);
  }

  return response;
}

function applyCookies(
  target: NextResponse,
  cookies: {
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }[]
) {
  cookies.forEach(({ name, value, options }) => {
    target.cookies.set(name, value, options);
  });
  return target;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
