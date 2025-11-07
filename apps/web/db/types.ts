// ============================================================================
// Constants
// ============================================================================

export const PERSONA_VALUES = ["student", "parent", "tutor"] as const;
export type Persona = (typeof PERSONA_VALUES)[number];

export const REWARD_STATUS_VALUES = ["granted", "denied", "pending"] as const;
export type RewardStatus = (typeof REWARD_STATUS_VALUES)[number];

export const CHALLENGE_STATUS_VALUES = [
  "pending",
  "active",
  "completed",
  "expired",
] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUS_VALUES)[number];

export const REWARD_TYPE_VALUES = [
  "streak_shield",
  "ai_minutes",
  "badge",
  "credits",
] as const;
export type RewardType = (typeof REWARD_TYPE_VALUES)[number];

export const DIFFICULTY_VALUES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTY_VALUES)[number];

// ============================================================================
// Type Definitions
// ============================================================================

export type ChallengeQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

