import { NextRequest, NextResponse } from "next/server";
import { chooseLoop, orchestratorInputSchema } from "@10x-k-factor/agents";

export const dynamic = "force-dynamic";
export const maxDuration = 1; // 1 second max duration

const TIMEOUT_MS = 150;

/**
 * Default fallback response when orchestrator times out or errors
 */
const DEFAULT_FALLBACK = {
  loop: "buddy_challenge",
  eligibility_reason: "timeout_fallback",
  rationale: "Orchestrator timeout - using default loop",
  features_used: ["fallback:timeout"],
  ttl_ms: 0,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const input = orchestratorInputSchema.parse(body);

    // Call orchestrator agent
    const output = chooseLoop(input);

    const latency = Date.now() - startTime;

    // Log latency for monitoring
    if (latency > TIMEOUT_MS) {
      console.warn(
        `[orchestrator] Slow response: ${latency}ms (threshold: ${TIMEOUT_MS}ms)`
      );
    } else {
      console.log(`[orchestrator] Response time: ${latency}ms`);
    }

    return NextResponse.json(
      {
        ...output,
        latency_ms: latency,
      },
      { status: 200 }
    );
  } catch (error) {
    const latency = Date.now() - startTime;

    console.error("[orchestrator] Error:", error);

    // Return fallback on validation error or other errors
    if (error instanceof Error && error.name === "ZodError") {
      console.error("[orchestrator] Validation error:", error);
      return NextResponse.json(
        {
          ...DEFAULT_FALLBACK,
          error: "Invalid input",
          latency_ms: latency,
        },
        { status: 400 }
      );
    }

    // Return fallback on timeout or other errors
    return NextResponse.json(
      {
        ...DEFAULT_FALLBACK,
        error: "Internal error - using fallback",
        latency_ms: latency,
      },
      { status: 500 }
    );
  }
}

