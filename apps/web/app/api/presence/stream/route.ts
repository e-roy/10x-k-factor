import { NextRequest } from "next/server";
import { getPresenceCount, isRedisHealthy } from "@/lib/presence";

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
      let lastHealthStatus: boolean | null = null;
      let intervalId: NodeJS.Timeout | null = null;
      let keepAliveId: NodeJS.Timeout | null = null;
      let isClosed = false;

      const send = (data: string) => {
        if (isClosed) {
          return; // Don't send if stream is closed
        }
        try {
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          // Controller might be closed or errored
          if (
            error instanceof Error &&
            (error.message.includes("closed") ||
              error.message.includes("errored"))
          ) {
            isClosed = true;
          }
          // Silently handle - stream may be closing
        }
      };

      // Send initial connection comment
      send(": connected\n\n");

      // Poll Redis for count updates
      const poll = async () => {
        if (isClosed) {
          return; // Stop polling if stream is closed
        }

        try {
          const count = await getPresenceCount(subject);
          const healthStatus = isRedisHealthy();

          // Send health status if it changed
          if (lastHealthStatus !== healthStatus) {
            lastHealthStatus = healthStatus;
            send(
              `data: ${JSON.stringify({ health: healthStatus ? "healthy" : "degraded" })}\n\n`
            );
          }

          // Send count update if it changed
          if (count !== lastCount) {
            lastCount = count;
            send(`data: ${JSON.stringify({ count })}\n\n`);
          }
        } catch (error) {
          // getPresenceCount should never throw (it returns 0 on error)
          // But if it does, we'll handle it gracefully
          if (lastCount !== 0) {
            lastCount = 0;
            send(`data: ${JSON.stringify({ count: 0 })}\n\n`);
          }
          // Continue polling even on error - don't close stream
        }
      };

      // Initial poll
      await poll();

      // Set up polling interval
      intervalId = setInterval(poll, POLL_INTERVAL_MS);

      // Keep-alive: send comment every 15 seconds
      keepAliveId = setInterval(() => {
        if (!isClosed) {
          send(": keepalive\n\n");
        }
      }, 15000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (keepAliveId) {
          clearInterval(keepAliveId);
          keepAliveId = null;
        }
        try {
          controller.close();
        } catch (error) {
          // Ignore errors on close
        }
      });
    },
    cancel() {
      // Handle stream cancellation
      // Cleanup is handled by abort signal listener
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
