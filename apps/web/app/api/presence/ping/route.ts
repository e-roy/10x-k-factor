import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pingPresence } from "@/lib/presence";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const VISITOR_ID_COOKIE = "visitor_id";

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
    // Parse request body
    const body = await request.json();
    const subject = validateSubject(body?.subject);

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Invalid subject. Must be a string (1-64 chars, alphanumeric + hyphens/spaces)",
        },
        { status: 400 }
      );
    }

    // Get user ID (session or visitor_id)
    const userId = await getUserId(request);

    // Ping presence
    await pingPresence(subject, userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[presence/ping] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
