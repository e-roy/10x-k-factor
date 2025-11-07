import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updatePersonaSchema = z.object({
  persona: z.enum(["student", "parent", "tutor"]),
});

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
    const validated = updatePersonaSchema.parse(body);

    await db
      .update(usersProfiles)
      .set({ persona: validated.persona })
      .where(eq(usersProfiles.userId, session.user.id));

    return NextResponse.json({
      success: true,
      persona: validated.persona,
    });
  } catch (error) {
    console.error("[api/user/persona] Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

