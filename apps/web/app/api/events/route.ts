import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { events } from "@/db/schema";
import { eventSchema } from "@10x-k-factor/lib";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const VISITOR_ID_COOKIE = "visitor_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get or create visitor_id from cookie
 */
function getVisitorId(request: NextRequest): string {
  const cookie = request.cookies.get(VISITOR_ID_COOKIE);
  if (cookie?.value) {
    return cookie.value;
  }
  // Generate new visitor ID (will be set in response)
  return randomUUID();
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedEvent = eventSchema.parse(body);

    // Get or create visitor_id from cookie
    let visitor_id = getVisitorId(request);
    const cookieVisitorId = request.cookies.get(VISITOR_ID_COOKIE)?.value;

    // Use visitor_id from event if provided, otherwise use cookie
    if (validatedEvent.visitor_id) {
      visitor_id = validatedEvent.visitor_id;
    }

    // Extract loop from payload if present
    const loop = validatedEvent.payload && typeof validatedEvent.payload === 'object' && 'loop' in validatedEvent.payload
      ? String(validatedEvent.payload.loop)
      : null;

    // Create props object without loop (since it's stored as top-level column)
    const { loop: _loop, ...props } = validatedEvent.payload && typeof validatedEvent.payload === 'object' 
      ? validatedEvent.payload as Record<string, unknown>
      : {};

    // Write to Postgres with new schema
    const [result] = await db.insert(events).values({
      ts: new Date(validatedEvent.timestamp || new Date()),
      userId: validatedEvent.user_id || null,
      anonId: visitor_id,
      loop,
      name: validatedEvent.name,
      props: props || {},
    }).returning();

    const eventId = result?.id;

    // Set visitor_id cookie if not already set
    const response = NextResponse.json(
      { success: true, id: eventId },
      { status: 201 }
    );

    if (!cookieVisitorId) {
      response.cookies.set(VISITOR_ID_COOKIE, visitor_id, {
        path: "/",
        maxAge: COOKIE_MAX_AGE,
        sameSite: "lax",
        httpOnly: false, // Client-side track() needs to read it
      });
    }

    return response;
  } catch (error) {
    console.error("[events] Validation or database error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid event data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
