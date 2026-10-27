import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const BOT = /bot|crawl|spider|slurp|bing|facebookexternalhit|preview|lighthouse|headless/i;

/**
 * Extends the Supabase session middleware with A/B testing concerns:
 * - first-party `sb_vid` visitor ID cookie (random UUID, ~90 days)
 * - bot detection by user-agent (`x-sb-bot: 1` header)
 * - forwards `sb_vid` to server components via request header `x-sb-vid`
 * - QA override forwarding `x-sb-force` when allowed
 *
 * Cookies set in the same response aren't readable by `cookies()` on the
 * first request, so the visitor id is forwarded through a request header.
 */
export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const existing = request.cookies.get("sb_vid")?.value;
  const vid = existing ?? crypto.randomUUID();

  const forwarded = new Headers(request.headers);
  forwarded.set("x-sb-vid", vid);

  const ua = request.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) forwarded.set("x-sb-bot", "1");

  const sbForce = request.nextUrl.searchParams.get("sb_force");
  const allowForce =
    process.env.VERCEL_ENV !== "production" ||
    process.env.ALLOW_FORCE_VARIANT === "true";
  if (sbForce && allowForce) {
    forwarded.set("x-sb-force", sbForce);
  }

  const res = NextResponse.next({
    request: { headers: forwarded },
    headers: supabaseResponse.headers,
  });

  if (!existing) {
    res.cookies.set("sb_vid", vid, {
      maxAge: 60 * 60 * 24 * 90,
      sameSite: "lax",
      path: "/",
      secure: true,
      httpOnly: true,
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
