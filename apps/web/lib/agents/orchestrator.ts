import type { OrchestratorInput, OrchestratorOutput } from "@10x-k-factor/agents";

const TIMEOUT_MS = 150;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Default fallback when orchestrator call times out or fails
 */
const DEFAULT_FALLBACK: OrchestratorOutput = {
  loop: "buddy_challenge",
  eligibility_reason: "timeout_fallback",
  rationale: "Orchestrator call timed out - using default loop",
  features_used: ["fallback:timeout"],
  ttl_ms: 0,
};

/**
 * Call the orchestrator API with 150ms timeout and fallback handling
 */
export async function callOrchestrator(
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/orchestrator/choose_loop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn("[orchestrator] API error:", response.status, errorData);
      return DEFAULT_FALLBACK;
    }

    const data = await response.json();
    return {
      loop: data.loop,
      eligibility_reason: data.eligibility_reason,
      rationale: data.rationale,
      features_used: data.features_used,
      ttl_ms: data.ttl_ms,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        `[orchestrator] Request timeout after ${TIMEOUT_MS}ms - using fallback`
      );
    } else {
      console.error("[orchestrator] Request failed:", error);
    }

    return DEFAULT_FALLBACK;
  }
}

