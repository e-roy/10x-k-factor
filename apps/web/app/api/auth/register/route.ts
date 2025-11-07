import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/auth-schema";
import { usersProfiles } from "@/db/schema/index";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      name: name || null,
    });

    // Create user profile with defaults
    await db.insert(usersProfiles).values({
      userId,
      persona: "student",
      minor: false,
      guardianId: null,
      onboardingCompleted: false,
      primaryColor: null,
      secondaryColor: null,
    });

    return NextResponse.json(
      { message: "User created successfully", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
