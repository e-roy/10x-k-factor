import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { rewards } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/rewards/balances
 * Get current reward balances for the authenticated user
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Calculate balances by summing granted rewards by type
    const balances = await db
      .select({
        type: rewards.type,
        total: sql<number>`COALESCE(SUM(${rewards.amount}), 0)::int`,
      })
      .from(rewards)
      .where(
        and(
          eq(rewards.userId, userId),
          eq(rewards.status, "granted")
        )
      )
      .groupBy(rewards.type);

    // Convert to object format
    const balanceMap: Record<string, number> = {
      streak_shield: 0,
      ai_minutes: 0,
      credits: 0,
    };

    for (const balance of balances) {
      balanceMap[balance.type] = balance.total;
    }

    return NextResponse.json({
      success: true,
      balances: balanceMap,
    });
  } catch (error) {
    console.error("[rewards/balances] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

