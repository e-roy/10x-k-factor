import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { smartLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySmartLinkSignature } from "@/lib/smart-links";

export const dynamic = "force-dynamic";

const VT_ATTRIB_COOKIE = "vt_attrib";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const SAFE_REDIRECT = "/";

/**
 * Build deep route URL from params
 */
function buildDeepRoute(params?: Record<string, unknown> | null): string {
  if (!params || typeof params !== "object") {
    return SAFE_REDIRECT;
  }

  // Check for resultId -> results route (prioritize over deckId)
  if (params.resultId && typeof params.resultId === "string") {
    return `/results/${params.resultId}`;
  }

  // Check for deckId -> FVM route
  if (params.deckId && typeof params.deckId === "string") {
    return `/fvm/skill/${params.deckId}`;
  }

  // Check for cohortId -> cohort route
  if (params.cohortId && typeof params.cohortId === "string") {
    return `/cohort/${params.cohortId}`;
  }

  // Default to home page
  return SAFE_REDIRECT;
}

/**
 * Extract UTM parameters from query string
 */
function extractUTMParams(request: NextRequest): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
} {
  const { searchParams } = request.nextUrl;
  return {
    utm_source: searchParams.get("utm_source") || undefined,
    utm_medium: searchParams.get("utm_medium") || undefined,
    utm_campaign: searchParams.get("utm_campaign") || undefined,
    utm_term: searchParams.get("utm_term") || undefined,
    utm_content: searchParams.get("utm_content") || undefined,
  };
}

/**
 * GET handler for smart link resolution
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Look up smart link in database
    const [link] = await db
      .select()
      .from(smartLinks)
      .where(eq(smartLinks.code, code))
      .limit(1);

    // Check if link exists
    if (!link) {
      console.warn(`[smart-link] Link not found: ${code}`);
      return NextResponse.redirect(new URL(SAFE_REDIRECT, request.url));
    }

    // Check expiry
    const now = new Date();
    if (link.expiresAt < now) {
      console.warn(`[smart-link] Link expired: ${code}`);
      return NextResponse.redirect(new URL(SAFE_REDIRECT, request.url));
    }

    // Verify signature
    const isValid = verifySmartLinkSignature(link.sig, {
      code: link.code,
      expiresAt: link.expiresAt,
      inviterId: link.inviterId,
      loop: link.loop,
      params: link.params || undefined,
    });

    if (!isValid) {
      console.warn(`[smart-link] Invalid signature: ${code}`);
      return NextResponse.redirect(new URL(SAFE_REDIRECT, request.url));
    }

    // Extract UTM parameters
    const utmParams = extractUTMParams(request);

    // Build attribution cookie data
    const attribData = {
      inviter_id: link.inviterId,
      loop: link.loop,
      smart_link_code: code,
      ...utmParams,
    };

    // Build deep route URL
    const deepRoute = buildDeepRoute(link.params);
    const redirectUrl = new URL(deepRoute, request.url);

    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl);

    // Set attribution cookie
    response.cookies.set(VT_ATTRIB_COOKIE, JSON.stringify(attribData), {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false, // May need client-side access
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[smart-link] Error resolving link:", error);
    // On any error, redirect to safe page
    return NextResponse.redirect(new URL(SAFE_REDIRECT, request.url));
  }
}
