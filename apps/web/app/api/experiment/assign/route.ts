import { NextRequest, NextResponse } from "next/server";
import {
  assignExperiment,
  experimentInputSchema,
} from "@10x-k-factor/agents";

export const dynamic = "force-dynamic";
export const maxDuration = 1; // 1 second max duration

const TIMEOUT_MS = 150;

/**
 * Default fallback response when experiment assignment times out or errors
 */
const DEFAULT_FALLBACK = {
  variant: "control",
  exposure_id: "exp_fallback",
  rationale: "Experiment assignment timeout - using default control variant",
  features_used: ["fallback:timeout"],
  ttl_ms: 0,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const input = experimentInputSchema.parse(body);

    // Call experiment agent
    const output = assignExperiment(input);

    const latency = Date.now() - startTime;

    // Log latency for monitoring
    if (latency > TIMEOUT_MS) {
      console.warn(
        `[experiment] Slow response: ${latency}ms (threshold: ${TIMEOUT_MS}ms)`
      );
    } else {
      console.log(`[experiment] Response time: ${latency}ms`);
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

    console.error("[experiment] Error:", error);

    // Return fallback on validation error or other errors
    if (error instanceof Error && error.name === "ZodError") {
      console.error("[experiment] Validation error:", error);
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

