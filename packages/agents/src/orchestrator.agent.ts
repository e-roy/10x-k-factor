import type {
  OrchestratorInput,
  OrchestratorOutput,
} from "./types";
import {
  orchestratorInputSchema,
} from "./types";

/**
 * Available viral loops
 */
const AVAILABLE_LOOPS = [
  "buddy_challenge",
  "results_rally",
  "proud_parent",
  "tutor_spotlight",
] as const;

type Loop = (typeof AVAILABLE_LOOPS)[number];

/**
 * Cooldown periods in hours for each loop
 */
const LOOP_COOLDOWNS: Record<Loop, number> = {
  buddy_challenge: 24,
  results_rally: 12,
  proud_parent: 48,
  tutor_spotlight: 72,
};

/**
 * Loop eligibility rules based on event and persona
 */
function getEligibleLoops(
  event: string,
  persona: "student" | "parent" | "tutor"
): Loop[] {
  const eligible: Loop[] = [];

  // Results viewed event - all personas can trigger loops
  if (event === "results_viewed") {
    if (persona === "student") {
      eligible.push("buddy_challenge", "results_rally");
    } else if (persona === "parent") {
      eligible.push("proud_parent", "results_rally");
    } else if (persona === "tutor") {
      eligible.push("tutor_spotlight", "results_rally");
    }
  }

  // Session complete event
  if (event === "session_complete") {
    if (persona === "student") {
      eligible.push("buddy_challenge");
    } else if (persona === "tutor") {
      eligible.push("tutor_spotlight");
    }
  }

  // Badge earned event
  if (event === "badge_earned") {
    eligible.push("results_rally");
  }

  // Default fallback
  if (eligible.length === 0) {
    eligible.push("buddy_challenge");
  }

  return eligible;
}

/**
 * Check if a loop is available based on cooldowns
 */
function isLoopAvailable(
  loop: Loop,
  cooldowns: Record<string, number>
): { available: boolean; reason: string } {
  const cooldownKey = `${loop}_hours`;
  const cooldownHours = cooldowns[cooldownKey];

  if (cooldownHours === undefined) {
    return { available: true, reason: "cooldown_ok" };
  }

  const requiredCooldown = LOOP_COOLDOWNS[loop];
  if (cooldownHours >= requiredCooldown) {
    return { available: true, reason: "cooldown_ok" };
  }

  return {
    available: false,
    reason: `cooldown_active: ${cooldownHours}h < ${requiredCooldown}h`,
  };
}

/**
 * Choose the best loop based on event, persona, subject, and cooldowns
 */
export function chooseLoop(
  input: OrchestratorInput
): OrchestratorOutput {
  // Validate input
  const validated = orchestratorInputSchema.parse(input);

  const { event, persona, subject, cooldowns } = validated;

  // Get eligible loops for this event/persona combination
  const eligibleLoops = getEligibleLoops(event, persona);

  // Find first available loop (not in cooldown)
  let selectedLoop: Loop = "buddy_challenge"; // Default fallback
  let eligibilityReason = "fallback_default";

  for (const loop of eligibleLoops) {
    const { available, reason } = isLoopAvailable(loop, cooldowns);
    if (available) {
      selectedLoop = loop;
      eligibilityReason = reason;
      break;
    }
  }

  // Build rationale
  const rationale = `Selected ${selectedLoop} for ${persona} after ${event}${
    subject ? ` in ${subject}` : ""
  }. ${eligibilityReason === "cooldown_ok" ? "Cooldown period satisfied." : "Using default due to cooldown constraints."}`;

  // Features used for auditing
  const featuresUsed = [
    `event:${event}`,
    `persona:${persona}`,
    ...(subject ? [`subject:${subject}`] : []),
    `loop:${selectedLoop}`,
    `reason:${eligibilityReason}`,
  ];

  return {
    loop: selectedLoop,
    eligibility_reason: eligibilityReason,
    rationale,
    features_used: featuresUsed,
    ttl_ms: 30000, // 30 seconds cache TTL
  };
}

