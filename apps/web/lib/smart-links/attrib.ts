import type { NextRequest } from "next/server";

const VT_ATTRIB_COOKIE = "vt_attrib";
const VISITOR_ID_COOKIE = "visitor_id";

export interface AttributionData {
  inviter_id: string;
  loop: string;
  smart_link_code: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Generate UUID v4 compatible with Edge Runtime (Web Crypto API)
 */
function generateUUID(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  // This should not be needed in Edge Runtime, but provides safety
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse attribution cookie value
 */
export function parseAttribCookie(
  cookieValue: string | undefined
): AttributionData | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as AttributionData;
    // Validate required fields
    if (parsed.inviter_id && parsed.loop && parsed.smart_link_code) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("[attrib] Failed to parse attribution cookie:", error);
    return null;
  }
}

/**
 * Get attribution data from request cookies (server-side)
 */
export function getAttribution(request: NextRequest): AttributionData | null {
  const cookie = request.cookies.get(VT_ATTRIB_COOKIE);
  return parseAttribCookie(cookie?.value);
}

/**
 * Get or create visitor_id from request cookies
 */
function getVisitorId(request: NextRequest): string {
  const cookie = request.cookies.get(VISITOR_ID_COOKIE);
  if (cookie?.value) {
    return cookie.value;
  }
  // Generate new visitor ID (will be set by /api/events if needed)
  return generateUUID();
}

/**
 * Track invite.opened event server-side
 * This fires the event to /api/events endpoint
 */
export async function trackInviteOpened(
  attribution: AttributionData,
  request: NextRequest
): Promise<void> {
  try {
    const visitor_id = getVisitorId(request);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";

    const event = {
      name: "invite.opened" as const,
      timestamp: new Date().toISOString(),
      visitor_id,
      payload: {
        smart_link_code: attribution.smart_link_code,
        loop: attribution.loop,
        inviter_id: attribution.inviter_id,
      },
    };

    // Fire and forget - don't await to avoid blocking
    fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      // Log but don't throw - tracking should never break the app
      console.error("[attrib] Failed to track invite.opened:", error);
    });
  } catch (error) {
    // Log but don't throw - tracking should never break the app
    console.error("[attrib] Error tracking invite.opened:", error);
  }
}
