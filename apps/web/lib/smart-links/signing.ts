import { createHmac, timingSafeEqual } from "crypto";

const HMAC_SECRET = process.env.SMARTLINK_HMAC_SECRET;

if (!HMAC_SECRET && process.env.NODE_ENV !== "test") {
  console.warn(
    "⚠️  SMARTLINK_HMAC_SECRET is missing. Smart link signing will fail."
  );
}

/**
 * Create canonical query string for signing
 * Sorts params keys to ensure consistent signature generation
 */
function createCanonicalQuery(params: {
  code: string;
  expiresAt: Date;
  inviterId: string;
  loop: string;
  params?: Record<string, unknown>;
}): string {
  const { code, expiresAt, inviterId, loop, params: linkParams } = params;

  // Convert params object to sorted key-value pairs
  const sortedParams = linkParams
    ? Object.entries(linkParams)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join("&")
    : "";

  // ISO 8601 timestamp for expiry
  const expiresAtISO = expiresAt.toISOString();

  return `code=${code}&expires_at=${expiresAtISO}&inviter_id=${inviterId}&loop=${loop}${sortedParams ? `&params=${sortedParams}` : ""}`;
}

/**
 * Generate HMAC SHA-256 signature for a smart link
 *
 * @param code - 12-character short code
 * @param expiresAt - Expiry timestamp
 * @param inviterId - User ID of the inviter
 * @param loop - Viral loop identifier
 * @param params - Optional parameters object
 * @returns Base64-encoded HMAC signature
 */
export function signSmartLink(params: {
  code: string;
  expiresAt: Date;
  inviterId: string;
  loop: string;
  params?: Record<string, unknown>;
}): string {
  if (!HMAC_SECRET) {
    throw new Error("SMARTLINK_HMAC_SECRET environment variable is required");
  }

  const canonicalQuery = createCanonicalQuery(params);
  const hmac = createHmac("sha256", HMAC_SECRET);
  hmac.update(canonicalQuery);
  return hmac.digest("base64");
}

/**
 * Verify HMAC signature for a smart link
 *
 * @param signature - Expected signature to verify against
 * @param params - Parameters used to generate the signature
 * @returns true if signature is valid, false otherwise
 */
export function verifySmartLinkSignature(
  signature: string,
  params: {
    code: string;
    expiresAt: Date;
    inviterId: string;
    loop: string;
    params?: Record<string, unknown>;
  }
): boolean {
  if (!HMAC_SECRET) {
    return false;
  }

  try {
    const expectedSignature = signSmartLink(params);
    // Use timing-safe comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[signing] Signature verification failed:", error);
    return false;
  }
}
