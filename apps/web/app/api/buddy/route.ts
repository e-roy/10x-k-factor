import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateBuddy } from "@/lib/buddy";

export const dynamic = "force-dynamic";

/**
 * GET /api/buddy
 * Get current user's agent buddy (STUDENTS ONLY)
 * Automatically creates buddy if it doesn't exist
 *
 * Returns:
 * - userId, archetype, appearance, state
 * - level (derived from user's XP)
 * - xp, progress (from XP system)
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Agent buddies are for students only
    if (session.user.persona !== "student") {
      return NextResponse.json(
        { error: "Agent buddies are only available for students" },
        { status: 403 }
      );
    }

    const buddy = await getOrCreateBuddy(session.user.id);

    return NextResponse.json(buddy);
  } catch (error) {
    console.error("[api/buddy] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

