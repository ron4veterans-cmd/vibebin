import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

function publicOrigin(request: Request, origin: string): string {
  if (process.env.NODE_ENV === "development") return origin;

  const forwarded = request.headers.get("x-forwarded-host");
  if (!forwarded) return origin;
  const host = forwarded.split(",")[0]?.trim().toLowerCase();
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/.test(host)) return origin;
  if (host !== "www.vibebin.app" && !host.endsWith(".vercel.app")) return origin;
  return `https://${host}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const base = publicOrigin(request, origin);

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${base}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${base}/login?error=auth`);
}
