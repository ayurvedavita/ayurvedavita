import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { CHOOSING_DESIGN, THEME_COOKIE, isTheme } from "@/lib/themes";

const ADMIN_COOKIE = "av_admin";

async function hasAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

// Optimistic checks only; admin pages and actions verify the session again server side.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !(await hasAdminSession(request))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // ?theme=sable sets the prototype theme cookie, so a link can be shared.
  const theme = searchParams.get("theme");
  if (CHOOSING_DESIGN && isTheme(theme)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("theme");
    const response = NextResponse.redirect(url);
    response.cookies.set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|icon.png).*)"],
};
