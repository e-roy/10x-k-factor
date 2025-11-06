import type { PersonalizeInput, PersonalizeOutput } from "@10x-k-factor/agents";

const TIMEOUT_MS = 150;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Default fallback when personalization call times out or fails
 */
const DEFAULT_FALLBACK: PersonalizeOutput = {
  copy: "Check this out! 🎯",
  deep_link_params: {},
  rationale: "Personalization call timed out - using default copy",
  features_used: ["fallback:timeout"],
  ttl_ms: 0,
};

/**
 * Call the personalization API with 150ms timeout and fallback handling
 */
export async function callPersonalize(
  input: PersonalizeInput
): Promise<PersonalizeOutput> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/personalize/compose`, {
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
      console.warn("[personalize] API error:", response.status, errorData);
      return DEFAULT_FALLBACK;
    }

    const data = await response.json();
    return {
      copy: data.copy,
      deep_link_params: data.deep_link_params,
      reward_preview: data.reward_preview,
      rationale: data.rationale,
      features_used: data.features_used,
      ttl_ms: data.ttl_ms,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      console.warn(
        `[personalize] Request timeout after ${TIMEOUT_MS}ms - using fallback`
      );
    } else {
      console.error("[personalize] Request failed:", error);
    }

    return DEFAULT_FALLBACK;
  }
}

