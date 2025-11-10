import { NextRequest, NextResponse } from "next/server";
import {
  chooseLoop,
  orchestratorInputSchema,
  assignExperiment,
  experimentInputSchema,
} from "@10x-k-factor/agents";

export const dynamic = "force-dynamic";
export const maxDuration = 1; // 1 second max duration

const TIMEOUT_MS = 150;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

    // Log experiment exposure event asynchronously (non-blocking)
    // Only if user_id is provided in the request body (not in schema, but can be passed)
    const userId = (body as { user_id?: string }).user_id;
    if (userId) {
      
      // Fire-and-forget: log exp.exposed event without blocking response
      // Use experiment name based on selected loop
      const experimentName = `loop_${output.loop}_experiment`;
      
      try {
        // Assign experiment variant (synchronous, fast)
        const experimentInput = experimentInputSchema.parse({
          user_id: userId,
          experiment_name: experimentName,
          experiment_config: {
            variants: ["control", "variant_a"],
            traffic_splits: undefined, // Equal splits
          },
        });
        
        const experimentOutput = assignExperiment(experimentInput);
        
        // Log exp.exposed event asynchronously (don't await)
        fetch(`${API_BASE_URL}/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "exp.exposed",
            user_id: userId,
            visitor_id: userId, // Fallback if no visitor_id
            timestamp: new Date().toISOString(),
            payload: {
              user_id: userId,
              experiment_name: experimentName,
              variant: experimentOutput.variant,
              exposure_id: experimentOutput.exposure_id,
            },
          }),
        }).catch((err) => {
          // Silently fail - event logging should not break orchestrator
          console.warn("[orchestrator] Failed to log exp.exposed event:", err);
        });
        
        // Include exposure info in response
        (output as typeof output & { exposure_id?: string }).exposure_id =
          experimentOutput.exposure_id;
      } catch (expError) {
        // Silently fail - experiment assignment should not break orchestrator
        console.warn("[orchestrator] Failed to assign experiment:", expError);
      }
    }

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

