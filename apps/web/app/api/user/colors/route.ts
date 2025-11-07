import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

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
    const { primaryColor, secondaryColor } = body;

    // Validate hex colors (optional, allow null to reset)
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    
    if (primaryColor && !hexRegex.test(primaryColor)) {
      return NextResponse.json(
        { error: "Invalid primary color format. Use #RRGGBB" },
        { status: 400 }
      );
    }

    if (secondaryColor && !hexRegex.test(secondaryColor)) {
      return NextResponse.json(
        { error: "Invalid secondary color format. Use #RRGGBB" },
        { status: 400 }
      );
    }

    // Update user colors in database
    const [updatedUser] = await db
      .update(users)
      .set({
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json(
      {
        success: true,
        user: {
          primaryColor: updatedUser.primaryColor,
          secondaryColor: updatedUser.secondaryColor,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[colors] Error updating colors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

