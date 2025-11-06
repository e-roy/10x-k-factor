import { NextRequest } from "next/server";
import { getPresenceCount } from "@/lib/presence";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 2500; // 2.5 seconds

/**
 * Validate and sanitize subject
 */
function validateSubject(subject: string | null): string | null {
  if (!subject) {
    return null;
  }
  if (subject.length === 0 || subject.length > 64) {
    return null;
  }
  // Allow alphanumeric, hyphens, spaces
  if (!/^[a-zA-Z0-9\-\s]+$/.test(subject)) {
    return null;
  }
  return subject.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subject = validateSubject(searchParams.get("subject"));

  if (!subject) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing subject parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastCount = -1;
      let intervalId: NodeJS.Timeout | null = null;
      let keepAliveId: NodeJS.Timeout | null = null;

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error("[presence/stream] Failed to send data:", error);
        }
      };

      // Send initial connection comment
      send(": connected\n\n");

      // Poll Redis for count updates
      const poll = async () => {
        try {
          const count = await getPresenceCount(subject);
          if (count !== lastCount) {
            lastCount = count;
            send(`data: ${JSON.stringify({ count })}\n\n`);
          }
        } catch (error) {
          console.error("[presence/stream] Poll error:", error);
          // Send error count (0) if polling fails
          if (lastCount !== 0) {
            lastCount = 0;
            send(`data: ${JSON.stringify({ count: 0 })}\n\n`);
          }
        }
      };

      // Initial poll
      await poll();

      // Set up polling interval
      intervalId = setInterval(poll, POLL_INTERVAL_MS);

      // Keep-alive: send comment every 15 seconds
      keepAliveId = setInterval(() => {
        send(": keepalive\n\n");
      }, 15000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (keepAliveId) {
          clearInterval(keepAliveId);
        }
        try {
          controller.close();
        } catch (error) {
          // Ignore errors on close
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
