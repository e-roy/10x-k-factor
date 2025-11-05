import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAttribution, trackInviteOpened } from "@/lib/smart-links";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check for NextAuth session cookie (works in Edge Runtime)
  // NextAuth v5 uses 'authjs.session-token' or 'next-auth.session-token' cookie
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Protected routes
  const protectedPaths = ["/results", "/cohort", "/fvm", "/admin"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing a protected route without session cookie, redirect to login
  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow auth API routes to pass through
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return response;
  }

  // Check for attribution cookie and track invite.opened event
  // Skip if already processed (check for processed flag in cookie)
  const attribProcessed = request.cookies.get("vt_attrib_processed");
  if (!attribProcessed) {
    const attribution = getAttribution(request);
    if (attribution) {
      // Track invite.opened event (fire and forget)
      trackInviteOpened(attribution, request);

      // Mark as processed to avoid duplicate events
      // Set cookie that expires in 1 hour (enough time for session)
      response.cookies.set("vt_attrib_processed", "1", {
        path: "/",
        maxAge: 60 * 60, // 1 hour
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/results/:path*",
    "/cohort/:path*",
    "/fvm/:path*",
    "/admin/:path*",
    "/sl/:path*",
    "/",
  ],
};
