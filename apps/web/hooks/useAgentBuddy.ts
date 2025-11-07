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
    data?: Record<string, unknown>; // Additional data for modal/navigation
  };
  rewardPreview?: {
    type: string;
    amount?: number;
    description?: string;
  };
  priority: "high" | "normal" | "low";
  expiresAt?: Date;
  challengeId?: string; // Link to challenge if applicable
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
  const [isVisible, setIsVisible] = useState(true);

  // Load pending challenges on mount
  useEffect(() => {
    const loadPendingChallenges = async () => {
      try {
        const response = await fetch('/api/challenges/pending');
        if (!response.ok) return;
        
        const pendingChallenges = await response.json();
        
        // Create speech bubbles for each pending challenge
        const bubbles: SpeechBubble[] = pendingChallenges.map((challenge: any) => ({
          id: `challenge-${challenge.id}`,
          copy: `Great session! I generated a ${challenge.difficulty} challenge with ${challenge.questions.length} questions to reinforce what you learned in ${challenge.subject}. Ready to test your knowledge? 🎯`,
          action: {
            type: "modal",
            target: "ChallengeModal",
            label: "Take Challenge",
            data: {
              challengeId: challenge.id,
              subject: challenge.subject,
              questionCount: challenge.questions.length,
              difficulty: challenge.difficulty,
            },
          },
          rewardPreview: {
            type: "xp",
            amount: 50,
            description: "Complete the challenge to earn XP and solidify your learning!",
          },
          priority: "high",
          challengeId: challenge.id,
          expiresAt: new Date(challenge.expiresAt),
        }));
        
        setSpeechBubbles(bubbles);
      } catch (err) {
        console.error("[useAgentBuddy] Error loading pending challenges:", err);
      }
    };
    
    loadPendingChallenges();
  }, [userId]);

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

  // Listen for challenge generation events
  useEffect(() => {
    const handleChallengeGenerated = async (event: CustomEvent) => {
      const { challengeId, subject } = event.detail;
      
      // Fetch challenge details
      try {
        const response = await fetch(`/api/challenges/${challengeId}`);
        if (!response.ok) throw new Error("Failed to fetch challenge");
        
        const challenge = await response.json();
        
        // Create speech bubble for the challenge
        const bubble: SpeechBubble = {
          id: `challenge-${challengeId}`,
          copy: `Great session! I generated a ${challenge.difficulty} challenge with ${challenge.questions.length} questions to reinforce what you learned in ${subject}. Ready to test your knowledge? 🎯`,
          action: {
            type: "modal",
            target: "ChallengeModal",
            label: "Take Challenge",
            data: {
              challengeId,
              subject,
              questionCount: challenge.questions.length,
              difficulty: challenge.difficulty,
            },
          },
          rewardPreview: {
            type: "xp",
            amount: 50,
            description: "Complete the challenge to earn XP and solidify your learning!",
          },
          priority: "high",
          challengeId,
          expiresAt: new Date(challenge.expiresAt),
        };
        
        addBubble(bubble);
      } catch (err) {
        console.error("[useAgentBuddy] Error fetching challenge:", err);
      }
    };

    const handleChallengeCompleted = (event: CustomEvent) => {
      const { challengeId } = event.detail;
      
      // Remove the bubble for this challenge
      setSpeechBubbles((prev) => 
        prev.filter((b) => b.challengeId !== challengeId)
      );
    };

    window.addEventListener("challengeGenerated", handleChallengeGenerated as EventListener);
    window.addEventListener("challengeCompleted", handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener("challengeGenerated", handleChallengeGenerated as EventListener);
      window.removeEventListener("challengeCompleted", handleChallengeCompleted as EventListener);
    };
  }, []);

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

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return {
    currentBubble: speechBubbles[0] || null,
    bubbleQueue: speechBubbles,
    bubbleCount: speechBubbles.length,
    isVisible,
    isLoading,
    error,
    dismissBubble,
    addBubble,
    toggleVisibility,
  };
}
