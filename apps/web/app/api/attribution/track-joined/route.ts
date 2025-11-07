import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAttribution } from "@/lib/smart-links/attrib";
import { track } from "@/lib/track";

export const dynamic = "force-dynamic";

/**
 * POST handler to track invite.joined event
 * Called after user signs up/signs in with attribution cookie
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

    // Get attribution from cookie
    const attribution = getAttribution(request);

    if (!attribution) {
      // No attribution cookie - user didn't come from an invite link
      return NextResponse.json(
        { success: true, tracked: false, reason: "no_attribution" },
        { status: 200 }
      );
    }

    // Track invite.joined event
    await track(
      "invite.joined",
      {
        smart_link_code: attribution.smart_link_code,
        loop: attribution.loop,
        inviter_id: attribution.inviter_id,
        invitee_id: session.user.id,
      },
      { user_id: session.user.id }
    );

    return NextResponse.json(
      {
        success: true,
        tracked: true,
        loop: attribution.loop,
        inviter_id: attribution.inviter_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[track-joined] Error tracking invite.joined:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

