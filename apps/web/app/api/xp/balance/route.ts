import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserXpWithLevel, getRecentXpEvents } from "@/lib/xp";
import type { Persona } from "@/db/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/xp/balance
 * Get XP balance and level info for the authenticated user
 *
 * Query params:
 * - personaType?: filter by persona ("student", "parent", "tutor")
 * - includeEvents?: include recent XP events (default false)
 *
 * Returns:
 * - xp: total XP (filtered by persona if specified)
 * - level: current level
 * - progress: progress toward next level (0-1)
 * - nextNeeded: XP needed to reach next level
 * - currentLevelXp: XP at start of current level
 * - nextLevelXp: XP at start of next level
 * - recentEvents?: recent XP events (if includeEvents=true)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const personaTypeParam = searchParams.get("personaType");
    const includeEventsParam = searchParams.get("includeEvents");

    // Validate persona type if provided
    let personaType: Persona | undefined;
    if (personaTypeParam) {
      if (
        personaTypeParam !== "student" &&
        personaTypeParam !== "parent" &&
        personaTypeParam !== "tutor"
      ) {
        return NextResponse.json(
          { error: "Invalid personaType parameter" },
          { status: 400 }
        );
      }
      personaType = personaTypeParam as Persona;
    }

    // Get XP and level info
    const xpInfo = await getUserXpWithLevel(session.user.id, personaType);

    // Optionally include recent events
    const response: Record<string, unknown> = {
      xp: xpInfo.xp,
      level: xpInfo.level,
      progress: xpInfo.progress,
      nextNeeded: xpInfo.nextNeeded,
      currentLevelXp: xpInfo.currentLevelXp,
      nextLevelXp: xpInfo.nextLevelXp,
    };

    if (includeEventsParam === "true") {
      const recentEvents = await getRecentXpEvents(session.user.id, 20);
      response.recentEvents = recentEvents;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/xp/balance] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

