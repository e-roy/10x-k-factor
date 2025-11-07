import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { results } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, ilike, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/search/results
 * Search results by subject
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
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Search user's own results by subject
    const userResults = await db
      .select({
        id: results.id,
        subject: results.subject,
        score: results.score,
      })
      .from(results)
      .where(
        and(
          eq(results.userId, session.user.id),
          ilike(results.subject || sql`''`, searchTerm)
        )
      )
      .limit(limit);

    return NextResponse.json({ results: userResults });
  } catch (error) {
    console.error("[search/results] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

