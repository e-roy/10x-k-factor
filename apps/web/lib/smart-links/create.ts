"use server";

import { randomBytes } from "crypto";
import { db } from "@/db/index";
import { smartLinks } from "@/db/schema";
import { signSmartLink } from "./signing";
import { eq } from "drizzle-orm";
import {
  checkInviteRateLimit,
  incrementInviteRateLimit,
} from "@/lib/rate-limit";

const CODE_LENGTH = 12;
const EXPIRY_DAYS = 7;

/**
 * Generate a URL-safe random code
 */
function generateCode(): string {
  // Generate 9 bytes (72 bits) and convert to base64url (URL-safe)
  // Slice to 12 characters
  return randomBytes(9).toString("base64url").slice(0, CODE_LENGTH);
}

/**
 * Ensure code is unique by checking database
 */
async function ensureUniqueCode(): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await db
      .select()
      .from(smartLinks)
      .where(eq(smartLinks.code, code))
      .limit(1);

    if (existing.length === 0) {
      return code;
    }

    // Collision detected, generate new code
    code = generateCode();
    attempts++;
  }

  throw new Error(
    `Failed to generate unique code after ${maxAttempts} attempts`
  );
}

export interface CreateSmartLinkParams {
  inviterId: string;
  loop: string;
  params?: Record<string, unknown>;
}

export interface CreateSmartLinkResult {
  code: string;
  url: string;
}

/**
 * Create a new smart link with HMAC signature
 *
 * @param params - Parameters for the smart link
 * @returns Smart link code and full URL
 * @throws Error if rate limit exceeded
 */
export async function createSmartLink(
  params: CreateSmartLinkParams
): Promise<CreateSmartLinkResult> {
  const { inviterId, loop, params: linkParams } = params;

  // Check rate limit
  const rateLimit = await checkInviteRateLimit(inviterId);
  if (!rateLimit.allowed) {
    const error = new Error(
      `Rate limit exceeded. You can send ${rateLimit.limit} invites per day. Try again after ${rateLimit.resetAt.toLocaleString()}.`
    ) as Error & { statusCode?: number };
    error.statusCode = 429;
    throw error;
  }

  // Generate unique code
  const code = await ensureUniqueCode();

  // Calculate expiry (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  // Generate HMAC signature
  const sig = signSmartLink({
    code,
    expiresAt,
    inviterId,
    loop,
    params: linkParams,
  });

  // Insert into database
  await db.insert(smartLinks).values({
    code,
    inviterId,
    loop,
    params: linkParams || null,
    sig,
    expiresAt,
  });

  // Increment rate limit counter (non-blocking)
  incrementInviteRateLimit(inviterId).catch((error) => {
    console.error("[createSmartLink] Failed to increment rate limit:", error);
    // Non-blocking - don't throw
  });

  // Build full URL (assuming NEXT_PUBLIC_APP_URL is set, fallback to relative)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/sl/${code}`;

  return { code, url };
}
