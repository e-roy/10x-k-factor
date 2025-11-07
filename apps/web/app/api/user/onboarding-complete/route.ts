import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    // For now, we'll use a simple approach: check if user has results or cohorts
    // In the future, we could add an onboardingCompleted field to users table
    // For MVP, we'll just return success - the onboarding check will be done client-side
    // by checking if user has results/cohorts

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

