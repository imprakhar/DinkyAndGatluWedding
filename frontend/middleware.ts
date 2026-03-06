import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  DEFAULT_AUTH_REDIRECT,
  isValidAuthRole,
  LOGIN_PATH,
} from "@/lib/auth";

function isPublicPath(pathname: string) {
  return (
    pathname === LOGIN_PATH ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/wedding-background.png")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === LOGIN_PATH) {
      const role = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (isValidAuthRole(role)) {
        return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
      }
    }
    return NextResponse.next();
  }

  const role = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!isValidAuthRole(role)) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
