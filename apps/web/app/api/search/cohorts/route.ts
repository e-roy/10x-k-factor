import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { cohorts } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { ilike, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/search/cohorts
 * Search cohorts by name or subject
 * 
 * Query params:
 * - q: search query string
 * - limit: number of results (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 10;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ cohorts: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    const results = await db
      .select({
        id: cohorts.id,
        name: cohorts.name,
        subject: cohorts.subject,
      })
      .from(cohorts)
      .where(
        or(
          ilike(cohorts.name, searchTerm),
          ilike(cohorts.subject || sql`''`, searchTerm)
        )
      )
      .limit(limit);

    return NextResponse.json({ cohorts: results });
  } catch (error) {
    console.error("[search/cohorts] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

