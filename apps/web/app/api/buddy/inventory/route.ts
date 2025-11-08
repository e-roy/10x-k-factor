import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInventory, addInventoryItem } from "@/lib/buddy";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addInventoryItemSchema = z.object({
  kind: z.enum(["cosmetic", "resource", "artifact"]),
  itemKey: z.string().min(1),
  label: z.string().optional(),
  qty: z.number().int().min(1).optional(),
  data: z.record(z.unknown()).optional(),
  acquiredFromEventId: z.string().optional(),
});

/**
 * GET /api/buddy/inventory
 * Get buddy inventory items for current user (STUDENTS ONLY)
 *
 * Query params:
 * - kind: filter by item kind (cosmetic, resource, artifact)
 *
 * Returns array of inventory items
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Agent buddies are for students only
    if (session.user.persona !== "student") {
      return NextResponse.json(
        { error: "Agent buddies are only available for students" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind") as
      | "cosmetic"
      | "resource"
      | "artifact"
      | null;

    const items = await getInventory(session.user.id, kind || undefined);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[api/buddy/inventory] GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buddy/inventory
 * Add item to buddy inventory (STUDENTS ONLY)
 *
 * Body:
 * - kind: "cosmetic" | "resource" | "artifact"
 * - itemKey: unique key for the item
 * - label?: display name
 * - qty?: quantity (default 1)
 * - data?: item-specific data (color, rarity, etc.)
 * - acquiredFromEventId?: XP event that granted this item
 *
 * Returns created/updated inventory item
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Agent buddies are for students only
    if (session.user.persona !== "student") {
      return NextResponse.json(
        { error: "Agent buddies are only available for students" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = addInventoryItemSchema.parse(body);

    const item = await addInventoryItem({
      userId: session.user.id,
      ...validated,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("[api/buddy/inventory] POST Error:", error);

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

