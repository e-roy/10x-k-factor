import type {
  PersonalizeInput,
  PersonalizeOutput,
} from "./types";
import {
  personalizeInputSchema,
} from "./types";

/**
 * Copy templates by persona and loop
 */
const COPY_TEMPLATES: Record<
  string,
  Record<string, (subject?: string) => string>
> = {
  student: {
    buddy_challenge: (subject) =>
      `I just completed a ${subject || "practice"} session! Challenge me to beat your score? 🎯`,
    results_rally: (subject) =>
      `Check out my ${subject || "latest"} results! Can you beat this? 💪`,
  },
  parent: {
    proud_parent: (subject) =>
      `My child just aced their ${subject || "practice"}! So proud! 🎉`,
    results_rally: (subject) =>
      `Amazing progress in ${subject || "learning"}! See how we're doing 📊`,
  },
  tutor: {
    tutor_spotlight: (subject) =>
      `New ${subject || "learning"} challenge ready! Join my students and level up 🚀`,
    results_rally: (subject) =>
      `My students are crushing ${subject || "it"}! Join the challenge 🏆`,
  },
};

/**
 * Default fallback copy
 */
const DEFAULT_COPY = "Check this out! 🎯";

/**
 * Reward previews by loop
 */
const REWARD_PREVIEWS: Record<
  string,
  { type: string; amount?: number; description: string }
> = {
  buddy_challenge: {
    type: "streak_shield",
    amount: 1,
    description: "Get a streak shield when your friend completes the challenge",
  },
  results_rally: {
    type: "ai_minutes",
    amount: 10,
    description: "Earn 10 AI tutor minutes when someone joins",
  },
  proud_parent: {
    type: "badge",
    description: "Unlock a special parent badge",
  },
  tutor_spotlight: {
    type: "credits",
    amount: 50,
    description: "Earn 50 credits for each student referral",
  },
};

/**
 * Generate personalized copy based on intent, persona, subject, and loop
 */
export function compose(input: PersonalizeInput): PersonalizeOutput {
  // Validate input
  const validated = personalizeInputSchema.parse(input);

  const { intent, persona, subject, loop } = validated;

  // Get copy template
  const personaTemplates = COPY_TEMPLATES[persona] || {};
  const templateFn = personaTemplates[loop];
  const hasTemplate = templateFn !== undefined;

  let copy = DEFAULT_COPY;
  if (hasTemplate && templateFn) {
    copy = templateFn(subject);
  } else {
    // Fallback: generic copy with loop context
    copy = `Join me in the ${loop.replace(/_/g, " ")}!${
      subject ? ` We're learning ${subject}.` : ""
    }`;
  }

  // Get reward preview
  const rewardPreview = REWARD_PREVIEWS[loop];

  // Build deep link params
  const deepLinkParams: Record<string, unknown> = {
    loop,
    ...(subject ? { subject } : {}),
    ...(intent ? { intent } : {}),
  };

  // Build rationale
  const rationale = `Generated personalized copy for ${persona} with intent ${intent} and loop ${loop}${
    subject ? ` in ${subject}` : ""
  }. Used template matching persona and loop combination.`;

  // Features used for auditing
  const featuresUsed = [
    `persona:${persona}`,
    `intent:${intent}`,
    `loop:${loop}`,
    ...(subject ? [`subject:${subject}`] : []),
    hasTemplate ? "template:matched" : "template:fallback",
  ];

  return {
    copy,
    deep_link_params: deepLinkParams,
    reward_preview: rewardPreview,
    rationale,
    features_used: featuresUsed,
    ttl_ms: 60000, // 60 seconds cache TTL
  };
}

