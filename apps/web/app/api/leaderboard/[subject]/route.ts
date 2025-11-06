import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

/**
 * Validate and sanitize subject parameter
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
 * GET /api/leaderboard/[subject]
 * 
 * Returns leaderboard for a subject
 * 
 * Query params:
 * - limit: number of entries to return (default: 10, max: 100)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subject: string }> }
) {
  try {
    const { subject: subjectParam } = await params;
    const subject = validateSubject(subjectParam);

    if (!subject) {
      return NextResponse.json(
        {
          error:
            "Invalid subject. Must be a string (1-64 chars, alphanumeric + hyphens/spaces)",
        },
        { status: 400 }
      );
    }

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    let limit = 10;

    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        limit = parsed;
      }
    }

    // Get leaderboard
    const entries = await getLeaderboard(subject, limit);

    return NextResponse.json(
      {
        subject,
        entries,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[leaderboard/api] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

