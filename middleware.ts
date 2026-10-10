import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For demo mode: automatically redirect login or signup directly to the active drivers demo dashboard
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/auth/active-drivers", req.url));
  }

  // All other pages and API routes pass freely without auth requirement
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/auth/:path*", "/api/auth/:path*"],
};