import { EventName, Event, eventSchema } from "@10x-k-factor/lib";

const VISITOR_ID_COOKIE = "visitor_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Generate UUID v4 (browser-compatible)
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create visitor_id from cookie
 */
function getVisitorId(): string {
  if (typeof document === "undefined") {
    // Server-side: should not be called (API route handles this)
    return generateUUID();
  }

  // Client-side: get from cookie or create new
  const cookies = document.cookie.split("; ");
  const visitorCookie = cookies.find((c) => c.startsWith(`${VISITOR_ID_COOKIE}=`));
  
  if (visitorCookie) {
    const id = visitorCookie.split("=")[1];
    if (id) return id;
  }

  // Generate new visitor ID
  const newVisitorId = generateUUID();
  
  // Set cookie (1 year expiry)
  document.cookie = `${VISITOR_ID_COOKIE}=${newVisitorId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  
  return newVisitorId;
}

/**
 * Track an event
 * Non-blocking: errors are logged but don't throw
 */
export async function track<T extends EventName>(
  name: T,
  payload: Extract<Event<T>, { name: T }>["payload"],
  options?: { user_id?: string }
): Promise<void> {
  try {
    const visitor_id = getVisitorId();
    
    const event: Event<T> = {
      name,
      timestamp: new Date().toISOString(),
      visitor_id,
      ...(options?.user_id && { user_id: options.user_id }),
      payload,
    } as Event<T>;

    // Validate event schema
    eventSchema.parse(event);

    // Send to API (fire and forget)
    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }).catch((error) => {
      // Log but don't throw - tracking should never break the app
      console.error("[track] Failed to send event:", error);
    });
  } catch (error) {
    // Log validation errors but don't throw
    console.error("[track] Event validation failed:", error);
  }
}
