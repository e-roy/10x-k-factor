/**
 * Trust & Safety checks
 * Phase 10: Stub implementation (always allows)
 * Phase 11: Full implementation with fraud detection
 */

export interface SafetyContext {
  loop?: string;
  rewardType?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export interface SafetyResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a reward grant is allowed
 * Phase 10: Always returns allowed=true
 * Phase 11: Will implement fraud detection, velocity checks, etc.
 */
export async function checkSafety(
  _userId: string,
  _context?: SafetyContext
): Promise<SafetyResult> {
  // Phase 10: Stub - always allow
  // Phase 11: Will implement:
  // - Velocity checks (grants per hour/day)
  // - Duplicate household detection
  // - Emulator heuristics
  // - Risk score calculation
  // - Invite caps enforcement

  return {
    allowed: true,
  };
}

