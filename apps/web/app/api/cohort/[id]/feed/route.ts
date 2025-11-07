import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { events, smartLinks } from "@/db/schema/index";
import { users } from "@/db/auth-schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/cohort/[id]/feed
 *
 * Returns activity feed for a cohort
 * Shows invite.joined and invite.fvm events
 *
 * Query params:
 * - subject: filter by subject
 * - createdBy: filter by cohort creator
 * - limit: number of events to return (default: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cohortId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const subject = searchParams.get("subject");
    const createdBy = searchParams.get("createdBy");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!cohortId) {
      return NextResponse.json(
        { error: "Cohort ID is required" },
        { status: 400 }
      );
    }

    // Get smart link codes created by cohort creator to filter events
    let smartLinkCodes: string[] = [];
    if (createdBy) {
      const cohortSmartLinks = await db
        .select({ code: smartLinks.code })
        .from(smartLinks)
        .where(eq(smartLinks.inviterId, createdBy))
        .limit(1000); // Reasonable limit

      smartLinkCodes = cohortSmartLinks.map((sl) => sl.code);
    }

    // Query events
    // We'll filter events that have smart_link_code in props matching our smart links
    // Since props is JSONB, we need to use a different approach
    // For simplicity, we'll get all relevant events and filter in memory
    // In production, you might want to use a GIN index on props and filter properly

    const query = db
      .select({
        id: events.id,
        name: events.name,
        ts: events.ts,
        userId: events.userId,
        props: events.props,
        userName: users.name,
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id))
      .where(
        and(
          inArray(events.name, ["invite.joined", "invite.fvm"])
          // If we have smart link codes, filter by them
          // Since props is JSONB, we'll filter after fetching
        )
      )
      .orderBy(desc(events.ts))
      .limit(limit * 2); // Fetch more to filter

    const allEvents = await query;

    // Filter events by smart link codes or subject
    const filteredEvents = allEvents.filter((event) => {
      const props = (event.props || {}) as Record<string, unknown>;
      const smartLinkCode = props.smart_link_code as string | undefined;

      // If we have smart link codes, filter by them
      if (smartLinkCodes.length > 0) {
        if (!smartLinkCode || !smartLinkCodes.includes(smartLinkCode)) {
          return false;
        }
      }

      // If subject is provided, check if it matches (from props or smart link)
      if (subject) {
        const eventSubject = props.subject as string | undefined;
        if (eventSubject && eventSubject !== subject) {
          return false;
        }
      }

      return true;
    });

    // Limit results
    const limitedEvents = filteredEvents.slice(0, limit);

    // Format events
    const formattedEvents = limitedEvents.map((event) => ({
      id: event.id,
      name: event.name,
      timestamp: event.ts?.toISOString() || new Date().toISOString(),
      userId: event.userId || null,
      userName: event.userName || null,
      props: (event.props || {}) as Record<string, unknown>,
    }));

    return NextResponse.json(
      {
        cohortId,
        events: formattedEvents,
        count: formattedEvents.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cohort/feed/api] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
