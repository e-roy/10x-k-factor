import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user's onboarding completed flag
    await db
      .update(usersProfiles)
      .set({ onboardingCompleted: true })
      .where(eq(usersProfiles.userId, session.user.id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/user/onboarding-complete] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

