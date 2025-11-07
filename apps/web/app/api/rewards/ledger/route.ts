import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { ledgerEntries } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { eq, desc, sql, and } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  limit: z.union([z.string(), z.null(), z.undefined()]).transform((val) => {
    if (val === null || val === undefined || val === "") return 50;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 50 : parsed;
  }).pipe(z.number().int().min(1).max(100)),
  offset: z.union([z.string(), z.null(), z.undefined()]).transform((val) => {
    if (val === null || val === undefined || val === "") return 0;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }).pipe(z.number().int().min(0)),
  type: z.enum(["reward_grant", "reward_denied"]).nullish(),
});

/**
 * GET /api/rewards/ledger
 * Get ledger entries for the authenticated user with pagination
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

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    const query = querySchema.parse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      type: searchParams.get("type"),
    });

    // Build where clause
    const whereConditions = [eq(ledgerEntries.userId, userId)];
    if (query.type) {
      whereConditions.push(eq(ledgerEntries.type, query.type));
    }

    // Fetch ledger entries with proper where clause
    const entries = await db
      .select()
      .from(ledgerEntries)
      .where(query.type ? and(eq(ledgerEntries.userId, userId), eq(ledgerEntries.type, query.type)) : eq(ledgerEntries.userId, userId))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(query.limit)
      .offset(query.offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ledgerEntries)
      .where(query.type ? and(eq(ledgerEntries.userId, userId), eq(ledgerEntries.type, query.type)) : eq(ledgerEntries.userId, userId));

    const total = totalResult?.count || 0;

    return NextResponse.json({
      success: true,
      entries,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
        hasMore: query.offset + entries.length < total,
      },
    });
  } catch (error) {
    console.error("[rewards/ledger] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

