import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackXpEvent, getUserXpWithLevel } from "@/lib/xp";
import { z } from "zod";
import type { Persona, XpEventType } from "@/db/types";
import { XP_EVENT_TYPE_VALUES } from "@/db/types";

export const dynamic = "force-dynamic";

// Zod schema for XP event metadata
const xpEventMetadataSchema = z.object({
  subject: z.string().optional(),
  skillTag: z.string().optional(),
  deckId: z.string().optional(),
  smartlinkId: z.string().optional(),
  inviteId: z.string().optional(),
  attemptId: z.string().optional(),
  score: z.number().int().min(0).max(5).optional(),
  streak: z.number().int().min(0).optional(),
  device: z.string().optional(),
  ipHash: z.string().optional(),
  causeEventId: z.string().optional(),
});

// Request body schema
const trackXpRequestSchema = z.object({
  personaType: z.enum(["student", "parent", "tutor"]),
  eventType: z.enum(XP_EVENT_TYPE_VALUES),
  referenceId: z.string().optional(),
  metadata: xpEventMetadataSchema.optional(),
  rawXp: z.number().int().min(0).optional(),
});

/**
 * POST /api/xp/track
 * Track an XP-worthy event for the authenticated user
 *
 * Body:
 * - personaType: "student" | "parent" | "tutor"
 * - eventType: XP event type (e.g., "challenge.completed")
 * - referenceId?: optional reference to challenge, link, etc.
 * - metadata?: optional event-specific data
 * - rawXp?: optional raw XP amount (defaults to 1)
 *
 * Returns:
 * - event: created event record
 * - xp: updated XP total
 * - level: current level
 * - progress: progress toward next level (0-1)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = trackXpRequestSchema.parse(body);

    // Track the XP event
    const event = await trackXpEvent({
      userId: session.user.id,
      personaType: validated.personaType as Persona,
      eventType: validated.eventType as XpEventType,
      referenceId: validated.referenceId,
      metadata: validated.metadata,
      rawXp: validated.rawXp,
    });

    // Get updated XP and level info
    const xpInfo = await getUserXpWithLevel(session.user.id);

    return NextResponse.json(
      {
        event: {
          id: event.id,
          eventType: event.eventType,
          rawXp: event.rawXp,
          createdAt: event.createdAt,
        },
        xp: xpInfo.xp,
        level: xpInfo.level,
        progress: xpInfo.progress,
        nextNeeded: xpInfo.nextNeeded,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/xp/track] Error:", error);

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

