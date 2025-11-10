"use strict";
// ============================================================================
// Constants
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.XP_EVENT_TYPE_VALUES = exports.DIFFICULTY_VALUES = exports.REWARD_TYPE_VALUES = exports.CHALLENGE_STATUS_VALUES = exports.REWARD_STATUS_VALUES = exports.PERSONA_VALUES = void 0;
exports.PERSONA_VALUES = ["student", "parent", "tutor"];
exports.REWARD_STATUS_VALUES = ["granted", "denied", "pending"];
exports.CHALLENGE_STATUS_VALUES = [
    "pending",
    "active",
    "completed",
    "expired",
];
exports.REWARD_TYPE_VALUES = [
    "streak_shield",
    "ai_minutes",
    "badge",
    "credits",
];
exports.DIFFICULTY_VALUES = ["easy", "medium", "hard"];
// XP Event Types - represents discrete actions that earn XP
exports.XP_EVENT_TYPE_VALUES = [
    "challenge.completed",
    "challenge.perfect",
    "challenge.streak_kept",
    "invite.sent",
    "invite.accepted",
    "invitee.fvm_reached",
    "results.viewed",
    "presence.session_minute",
    "cohort.leaderboard_top3",
    "reward.claimed",
    "session.tutor_5star",
    "parent.recap_shared",
    "agent.nudge_accepted",
];
