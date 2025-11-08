import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { usersProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user profile to get subjects
    const [profile] = await db
      .select()
      .from(usersProfiles)
      .where(eq(usersProfiles.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      persona: session.user.persona || "student",
      role: session.user.role || null,
      subjects: profile?.subjects || [], // Return enrolled subjects
    });
  } catch (error) {
    console.error("[api/user/me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

