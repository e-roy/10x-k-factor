import { z } from "zod";

// Orchestrator input schema
export const orchestratorInputSchema = z.object({
  event: z.string().min(1), // e.g., "results_viewed", "session_complete"
  persona: z.enum(["student", "parent", "tutor"]),
  subject: z.string().optional(),
  cooldowns: z
    .record(z.string(), z.number())
    .optional()
    .default({}), // e.g., { "buddy_challenge_hours": 24 }
});

export type OrchestratorInput = z.infer<typeof orchestratorInputSchema>;

// Orchestrator output schema
export const orchestratorOutputSchema = z.object({
  loop: z.string(), // e.g., "buddy_challenge", "results_rally"
  eligibility_reason: z.string(), // e.g., "cooldown_ok", "cooldown_active"
  rationale: z.string(), // Human-readable explanation
  features_used: z.array(z.string()).optional(), // For debugging/auditing
  ttl_ms: z.number().optional(), // Cache TTL in milliseconds
});

export type OrchestratorOutput = z.infer<typeof orchestratorOutputSchema>;

// Personalization input schema
export const personalizeInputSchema = z.object({
  intent: z.string().min(1), // e.g., "challenge_friend", "share_results"
  persona: z.enum(["student", "parent", "tutor"]),
  subject: z.string().optional(),
  loop: z.string().min(1), // e.g., "buddy_challenge"
});

export type PersonalizeInput = z.infer<typeof personalizeInputSchema>;

// Personalization output schema
export const personalizeOutputSchema = z.object({
  copy: z.string(), // Personalized copy/text
  deep_link_params: z.record(z.string(), z.unknown()).optional(), // Parameters for deep linking
  reward_preview: z
    .object({
      type: z.string(),
      amount: z.number().optional(),
      description: z.string().optional(),
    })
    .optional(),
  rationale: z.string(), // Human-readable explanation
  features_used: z.array(z.string()).optional(), // For debugging/auditing
  ttl_ms: z.number().optional(), // Cache TTL in milliseconds
});

export type PersonalizeOutput = z.infer<typeof personalizeOutputSchema>;

