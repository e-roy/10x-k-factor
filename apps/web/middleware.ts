import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAttribution, trackInviteOpened } from "@/lib/smart-links/attrib";

const AUTHED_PREFIX = "/app";
const PUBLIC_PATHS = ["/", "/login", "/sl/", "/~offline"];
// Explicitly exclude auth API routes from any processing
const AUTH_API_PREFIX = "/api/auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const response = NextResponse.next();

  // Always allow auth API routes to pass through without any processing
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return response;
  }

  // Allow other API routes and public paths to pass through
  if (pathname.startsWith("/api") || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    // Still process attribution for public paths (but not auth routes)
    const attribProcessed = request.cookies.get("vt_attrib_processed");
    if (!attribProcessed) {
      const attribution = getAttribution(request);
      if (attribution) {
        trackInviteOpened(attribution, request);
        response.cookies.set("vt_attrib_processed", "1", {
          path: "/",
          maxAge: 60 * 60,
          sameSite: "lax",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
        });
      }
    }
    return response;
  }

  // Protect /app/* routes
  if (pathname.startsWith(AUTHED_PREFIX)) {
    // getToken expects a request with cookies, which NextRequest has
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = await getToken({ req: request as any });
    if (!token) {
      // Preserve deep-link intent with next param
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }

    // Protect admin routes - only allow users with admin role
    if (pathname.startsWith(`${AUTHED_PREFIX}/admin`)) {
      // Token type includes role from our extended JWT type (see types/next-auth.d.ts)
      const userRole = (token as { role?: string | null }).role;
      if (userRole !== "admin") {
        // Redirect non-admins to dashboard
        return NextResponse.redirect(new URL("/app", request.url));
      }
    }
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
  matcher: ["/((?!_next|.*\\..*).*)"],
};
