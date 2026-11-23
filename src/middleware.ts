import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, authEnabled, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();
  const res = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (res.valid) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|icon-192.png|icon-512.png|manifest.webmanifest|sw.js|favicon.ico).*)"],
};
