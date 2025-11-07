import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { cohorts } from "@/db/schema/index";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";
import { desc } from "drizzle-orm";

const createCohortSchema = z.object({
  name: z.string().min(1).max(128),
  subject: z.string().max(64).optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/cohorts
 * Create a new cohort for the authenticated user
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
    const validated = createCohortSchema.parse(body);

    const cohortId = randomUUID();

    const [cohort] = await db
      .insert(cohorts)
      .values({
        id: cohortId,
        name: validated.name,
        subject: validated.subject || null,
        createdBy: session.user.id,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { success: true, cohort },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[cohorts] Error creating cohort:", error);
    return NextResponse.json(
      { error: "Failed to create cohort" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cohorts
 * Get all cohorts (public list)
 */
export async function GET(_request: NextRequest) {
  try {
    const allCohorts = await db
      .select()
      .from(cohorts)
      .orderBy(desc(cohorts.createdAt))
      .limit(100);

    return NextResponse.json({ cohorts: allCohorts });
  } catch (error) {
    console.error("[cohorts] Error fetching cohorts:", error);
    return NextResponse.json(
      { error: "Failed to fetch cohorts" },
      { status: 500 }
    );
  }
}

