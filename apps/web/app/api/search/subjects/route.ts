import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { results } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/search/subjects
 * Search subjects from results
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
      return NextResponse.json({ subjects: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Get distinct subjects from results
    const resultsSubjects = await db
      .selectDistinct({
        subject: results.subject,
      })
      .from(results)
      .where(
        sql`${results.subject} IS NOT NULL AND ${results.subject} ILIKE ${searchTerm}`
      )
      .limit(limit);

    // Extract unique subjects
    const allSubjects = new Set<string>();
    resultsSubjects.forEach((row) => {
      if (row.subject) {
        allSubjects.add(row.subject.toLowerCase().trim());
      }
    });

    const subjects = Array.from(allSubjects)
      .slice(0, limit)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("[search/subjects] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

