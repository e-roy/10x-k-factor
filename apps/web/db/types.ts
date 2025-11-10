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

// XP Event Types - represents discrete actions that earn XP
export const XP_EVENT_TYPE_VALUES = [
  "challenge.completed",
  "challenge.perfect",
  "challenge.streak_kept",
  "invite.sent",
  "invite.accepted",
  "invitee.fvm_reached",
  "results.viewed",
  "presence.session_minute",
  "reward.claimed",
  "session.tutor_5star",
  "parent.recap_shared",
  "agent.nudge_accepted",
] as const;
export type XpEventType = (typeof XP_EVENT_TYPE_VALUES)[number];

// ============================================================================
// Type Definitions
// ============================================================================

export type ChallengeQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

// XP Event Metadata - flexible structure for event-specific data
export type XpEventMetadata = {
  subject?: string;
  skillTag?: string;
  deckId?: string;
  smartlinkId?: string;
  inviteId?: string;
  attemptId?: string;
  score?: number; // 0-5
  streak?: number;
  device?: string;
  ipHash?: string;
  causeEventId?: string; // causal chain tracking
};

