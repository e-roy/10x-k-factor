"use client";

import { useEffect, useState } from "react";
import type { OrchestratorOutput, PersonalizeOutput } from "@10x-k-factor/agents";

export interface SpeechBubble {
  id: string;
  copy: string;
  action?: {
    type: "navigate" | "modal";
    target: string;
    label?: string;
  };
  rewardPreview?: {
    type: string;
    amount?: number;
    description?: string;
  };
  priority: "high" | "normal" | "low";
  expiresAt?: Date;
}

interface UseAgentBuddyOptions {
  userId: string;
  persona: "student" | "parent" | "tutor";
  currentContext?: {
    page?: string;
    subject?: string;
    recentEvent?: string;
  };
}

export function useAgentBuddy(options: UseAgentBuddyOptions) {
  const { userId, persona, currentContext } = options;
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch agent decision when context changes
  useEffect(() => {
    if (!currentContext?.recentEvent) return;

    const fetchAgentDecision = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Ask orchestrator which loop to trigger
        const orchResponse = await fetch("/api/orchestrator/choose_loop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: currentContext.recentEvent,
            persona,
            subject: currentContext.subject,
            cooldowns: {}, // TODO: Fetch from user state
          }),
        });

        if (!orchResponse.ok) {
          throw new Error("Orchestrator API failed");
        }

        const orchData: OrchestratorOutput = await orchResponse.json();

        // 2. Get personalized copy
        const persResponse = await fetch("/api/personalize/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "share_invite",
            persona,
            subject: currentContext.subject,
            loop: orchData.loop,
          }),
        });

        if (!persResponse.ok) {
          throw new Error("Personalization API failed");
        }

        const persData: PersonalizeOutput = await persResponse.json();

        // 3. Create speech bubble
        const newBubble: SpeechBubble = {
          id: `bubble-${Date.now()}`,
          copy: persData.copy,
          action: {
            type: "modal",
            target: "ChallengeModal",
            label: "Create Challenge",
          },
          rewardPreview: persData.reward_preview,
          priority: "high",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        };

        setSpeechBubbles((prev) => [newBubble, ...prev]);
      } catch (err) {
        console.error("[useAgentBuddy] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDecision();
  }, [currentContext?.recentEvent, persona, userId, currentContext?.subject]);

  const dismissBubble = (id: string) => {
    setSpeechBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  const addBubble = (bubble: Omit<SpeechBubble, "id">) => {
    setSpeechBubbles((prev) => [
      {
        ...bubble,
        id: `bubble-${Date.now()}-${Math.random()}`,
      },
      ...prev,
    ]);
  };

  return {
    currentBubble: speechBubbles[0] || null,
    bubbleQueue: speechBubbles,
    isLoading,
    error,
    dismissBubble,
    addBubble,
  };
}
