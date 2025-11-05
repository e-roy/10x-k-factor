import { z } from "zod";

// Base event schema with common fields
const baseEventSchema = z.object({
  timestamp: z.string().datetime().optional().default(() => new Date().toISOString()),
  visitor_id: z.string().min(1),
  user_id: z.string().optional(),
});

// Invite event payloads
const inviteSentPayloadSchema = z.object({
  inviter_id: z.string(),
  loop: z.string(),
  smart_link_code: z.string().optional(),
  subject: z.string().optional(),
});

const inviteOpenedPayloadSchema = z.object({
  smart_link_code: z.string(),
  loop: z.string(),
  inviter_id: z.string().optional(),
});

const inviteJoinedPayloadSchema = z.object({
  smart_link_code: z.string(),
  loop: z.string(),
  inviter_id: z.string(),
  invitee_id: z.string().optional(),
});

const inviteFvmPayloadSchema = z.object({
  smart_link_code: z.string(),
  loop: z.string(),
  inviter_id: z.string(),
  invitee_id: z.string().optional(),
  deck_id: z.string(),
  completion_time_ms: z.number().optional(),
});

// Presence event payload
const presencePingPayloadSchema = z.object({
  subject: z.string(),
});

// Reward event payload
const rewardGrantedPayloadSchema = z.object({
  user_id: z.string(),
  reward_type: z.string(),
  amount: z.number().optional(),
  loop: z.string().optional(),
  policy: z.string().optional(),
});

// Experiment exposure event payload
const expExposedPayloadSchema = z.object({
  user_id: z.string(),
  experiment_name: z.string(),
  variant: z.string(),
  exposure_id: z.string().optional(),
});

// Event schemas
export const inviteSentEventSchema = baseEventSchema.extend({
  name: z.literal("invite.sent"),
  payload: inviteSentPayloadSchema,
});

export const inviteOpenedEventSchema = baseEventSchema.extend({
  name: z.literal("invite.opened"),
  payload: inviteOpenedPayloadSchema,
});

export const inviteJoinedEventSchema = baseEventSchema.extend({
  name: z.literal("invite.joined"),
  payload: inviteJoinedPayloadSchema,
});

export const inviteFvmEventSchema = baseEventSchema.extend({
  name: z.literal("invite.fvm"),
  payload: inviteFvmPayloadSchema,
});

export const presencePingEventSchema = baseEventSchema.extend({
  name: z.literal("presence.ping"),
  payload: presencePingPayloadSchema,
});

export const rewardGrantedEventSchema = baseEventSchema.extend({
  name: z.literal("reward.granted"),
  payload: rewardGrantedPayloadSchema,
});

export const expExposedEventSchema = baseEventSchema.extend({
  name: z.literal("exp.exposed"),
  payload: expExposedPayloadSchema,
});

// Union of all event schemas
export const eventSchema = z.discriminatedUnion("name", [
  inviteSentEventSchema,
  inviteOpenedEventSchema,
  inviteJoinedEventSchema,
  inviteFvmEventSchema,
  presencePingEventSchema,
  rewardGrantedEventSchema,
  expExposedEventSchema,
]);

// Type exports
export type EventName =
  | "invite.sent"
  | "invite.opened"
  | "invite.joined"
  | "invite.fvm"
  | "presence.ping"
  | "reward.granted"
  | "exp.exposed";

export type Event<T extends EventName = EventName> = z.infer<
  typeof eventSchema
> & { name: T };

// Type-safe event payloads
export type InviteSentEvent = z.infer<typeof inviteSentEventSchema>;
export type InviteOpenedEvent = z.infer<typeof inviteOpenedEventSchema>;
export type InviteJoinedEvent = z.infer<typeof inviteJoinedEventSchema>;
export type InviteFvmEvent = z.infer<typeof inviteFvmEventSchema>;
export type PresencePingEvent = z.infer<typeof presencePingEventSchema>;
export type RewardGrantedEvent = z.infer<typeof rewardGrantedEventSchema>;
export type ExpExposedEvent = z.infer<typeof expExposedEventSchema>;

