import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { users } from "@/db/auth-schema";
import { usersProfiles } from "@/db/user-schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Fetch list of users for admin seed form
 * Only accessible to admins
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    // Fetch all users with their profiles
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        persona: usersProfiles.persona,
      })
      .from(users)
      .leftJoin(usersProfiles, eq(users.id, usersProfiles.userId))
      .orderBy(users.name);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("[admin/users] Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

