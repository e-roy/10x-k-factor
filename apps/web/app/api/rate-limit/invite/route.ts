import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkInviteRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/rate-limit/invite
 * 
 * Check if current user can send invites
 * Returns rate limit status
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
    const result = await checkInviteRateLimit(userId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[rate-limit/api] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

