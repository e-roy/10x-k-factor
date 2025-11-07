import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { results } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

const createResultSchema = z.object({
  subject: z.string().max(64).optional(),
  score: z.number().int().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/results
 * Create a new result for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createResultSchema.parse(body);

    const resultId = randomUUID();

    const [result] = await db
      .insert(results)
      .values({
        id: resultId,
        userId: session.user.id,
        subject: validated.subject || null,
        score: validated.score || null,
        metadata: validated.metadata || {},
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[results] Error creating result:", error);
    return NextResponse.json(
      { error: "Failed to create result" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/results
 * Get all results for the authenticated user
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

    const userResults = await db
      .select()
      .from(results)
      .where(eq(results.userId, session.user.id))
      .orderBy(desc(results.createdAt))
      .limit(100);

    return NextResponse.json({ results: userResults });
  } catch (error) {
    console.error("[results] Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

