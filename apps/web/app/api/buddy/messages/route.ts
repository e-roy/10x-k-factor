import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBuddyMessages, addBuddyMessage } from "@/lib/buddy";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addMessageSchema = z.object({
  role: z.enum(["buddy", "system", "user"]),
  content: z.string().min(1),
  meta: z.record(z.unknown()).optional(),
});

/**
 * GET /api/buddy/messages
 * Get buddy message history for current user (STUDENTS ONLY)
 *
 * Query params:
 * - limit: number of messages to return (default 50)
 *
 * Returns array of messages ordered by newest first
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Agent buddies are for students only (admins can also access for testing)
    if (session.user.persona !== "student" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Agent buddies are only available for students" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await getBuddyMessages(session.user.id, limit);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[api/buddy/messages] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buddy/messages
 * Add a message to buddy chat history (STUDENTS ONLY)
 *
 * Body:
 * - role: "buddy" | "system" | "user"
 * - content: message content
 * - meta?: optional metadata (nudgeIds, loopSource, etc.)
 *
 * Returns created message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Agent buddies are for students only (admins can also access for testing)
    if (session.user.persona !== "student" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Agent buddies are only available for students" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = addMessageSchema.parse(body);

    const message = await addBuddyMessage({
      userId: session.user.id,
      role: validated.role,
      content: validated.content,
      meta: validated.meta,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[api/buddy/messages] POST Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

