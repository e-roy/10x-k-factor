import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pingPresence } from "@/lib/presence";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const VISITOR_ID_COOKIE = "visitor_id";
let lastPingErrorLogTime: number | undefined = undefined;

/**
 * Validate and sanitize subject
 */
function validateSubject(subject: unknown): string | null {
  if (typeof subject !== "string") {
    return null;
  }
  if (subject.length === 0 || subject.length > 64) {
    return null;
  }
  // Allow alphanumeric, hyphens, spaces
  if (!/^[a-zA-Z0-9\-\s]+$/.test(subject)) {
    return null;
  }
  return subject.trim();
}

/**
 * Get or create visitor_id from cookie
 */
function getVisitorId(request: NextRequest): string {
  const cookie = request.cookies.get(VISITOR_ID_COOKIE);
  if (cookie?.value) {
    return cookie.value;
  }
  // Generate new visitor ID
  return randomUUID();
}

/**
 * Get user ID from session or visitor_id cookie
 * Priority: authenticated user ID > visitor_id cookie
 */
async function getUserId(request: NextRequest): Promise<string> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  return getVisitorId(request);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body - handle JSON parsing errors
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    const subject = validateSubject(
      body && typeof body === "object" && "subject" in body
        ? body.subject
        : null
    );

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Invalid subject. Must be a string (1-64 chars, alphanumeric + hyphens/spaces)",
        },
        { status: 400 }
      );
    }

    // Get user ID (session or visitor_id) - handle auth errors gracefully
    let userId: string;
    try {
      userId = await getUserId(request);
    } catch (error) {
      // If auth fails, use visitor ID as fallback
      userId = getVisitorId(request);
    }

    // Ping presence - this should never throw (handled in lib/presence.ts)
    // But we'll catch just in case
    try {
      await pingPresence(subject, userId);
    } catch (error) {
      // pingPresence should never throw, but if it does, log and continue
      // Don't return error - presence is non-critical
    }

    // Always return 200 - presence is non-critical
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Catch-all for any unexpected errors
    // Still return 200 since presence is non-critical
    // Only log if it's a truly unexpected error (not from pingPresence)
    if (error instanceof Error && !error.message.includes("presence")) {
      // Suppress repeated errors - only log once per minute
      const now = Date.now();
      if (!lastPingErrorLogTime || now - lastPingErrorLogTime > 60000) {
        console.error("[presence/ping] Unexpected error:", error);
        lastPingErrorLogTime = now;
      }
    }

    // Always return 200 - presence failures should not break the app
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
