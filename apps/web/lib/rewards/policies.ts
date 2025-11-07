/**
 * Reward policies by persona and trigger
 * Defines what rewards are granted and their unit costs
 */

export type RewardType = "streak_shield" | "ai_minutes" | "badge" | "credits";
export type Persona = "student" | "parent" | "tutor";
export type Trigger = "on_send" | "on_fvm_complete";

export interface RewardPolicy {
  type: RewardType;
  amount?: number; // nullable for badges
  unitCostCents: number; // cost per unit in cents
  description: string;
}

export interface PersonaPolicies {
  on_send?: RewardPolicy; // Preview only, not granted yet
  on_fvm_complete: RewardPolicy; // Granted when FVM completed within 48h
}

/**
 * Unit costs in cents
 */
const UNIT_COSTS: Record<RewardType, number> = {
  streak_shield: 50, // 50 cents per shield
  ai_minutes: 10, // 10 cents per minute
  badge: 100, // 100 cents per badge
  credits: 1, // 1 cent per credit
};

/**
 * Reward policies by persona
 */
const POLICIES: Record<Persona, PersonaPolicies> = {
  student: {
    on_send: {
      type: "streak_shield",
      amount: 1,
      unitCostCents: UNIT_COSTS.streak_shield,
      description: "Streak shield preview (granted on FVM completion)",
    },
    on_fvm_complete: {
      type: "ai_minutes",
      amount: 15,
      unitCostCents: UNIT_COSTS.ai_minutes,
      description: "+15 AI minutes when friend completes FVM within 48h",
    },
  },
  parent: {
    on_fvm_complete: {
      type: "badge",
      unitCostCents: UNIT_COSTS.badge,
      description: "Parent badge when child's friend completes FVM",
    },
  },
  tutor: {
    on_fvm_complete: {
      type: "credits",
      amount: 50,
      unitCostCents: UNIT_COSTS.credits,
      description: "50 credits when student completes FVM",
    },
  },
};

/**
 * Get reward policy for a persona and trigger
 */
export function getRewardPolicy(
  persona: Persona,
  trigger: Trigger
): RewardPolicy | null {
  const personaPolicy = POLICIES[persona];
  if (!personaPolicy) {
    return null;
  }

  if (trigger === "on_send") {
    return personaPolicy.on_send || null;
  }

  return personaPolicy.on_fvm_complete || null;
}

/**
 * Get unit cost for a reward type
 */
export function getUnitCost(rewardType: RewardType): number {
  return UNIT_COSTS[rewardType] || 0;
}

/**
 * Calculate total cost in cents
 */
export function calculateTotalCost(
  rewardType: RewardType,
  amount: number
): number {
  return getUnitCost(rewardType) * amount;
}

