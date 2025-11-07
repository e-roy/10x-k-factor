"use client";

import { useAgentBuddy } from "@/hooks/useAgentBuddy";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AgentBuddyProps {
  userId: string;
  persona: "student" | "parent" | "tutor";
  className?: string;
}

export function AgentBuddy({ userId, persona, className }: AgentBuddyProps) {
  const { currentBubble, dismissBubble } = useAgentBuddy({
    userId,
    persona,
    currentContext: {
      page: "dashboard",
      // These would be set dynamically based on user actions
    },
  });

  if (!currentBubble) {
    return (
      <div className={cn("relative", className)}>
        {/* Agent buddy idle state */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-muted hover:border-persona transition-colors">
          <Image
            width={64}
            height={64} 
            src="/icons/agent-buddy-idle.svg"
            alt="Agent Buddy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Agent buddy active state */}
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-persona animate-pulse shadow-persona">
        <Image
          width={64}
          height={64}
          src="/icons/agent-buddy-active.svg"
          alt="Agent Buddy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Speech bubble */}
      <div
        className={cn(
          "absolute top-0 right-full mr-3 w-72 p-4 rounded-2xl shadow-persona",
          "border border-persona bg-persona-overlay",
          "animate-in slide-in-from-right-5 fade-in duration-300"
        )}
      >
        {/* Dismiss button */}
        <button
          onClick={() => dismissBubble(currentBubble.id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Speech bubble content */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{currentBubble.copy}</p>

          {/* Reward preview */}
          {currentBubble.rewardPreview && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {currentBubble.rewardPreview.type === "streak_shield"
                  ? "🛡️"
                  : currentBubble.rewardPreview.type === "ai_minutes"
                    ? "🤖"
                    : currentBubble.rewardPreview.type === "badge"
                      ? "🏆"
                      : "💎"}
              </span>
              <span>{currentBubble.rewardPreview.description}</span>
            </div>
          )}

          {/* Action button */}
          {currentBubble.action && (
            <Button
              size="sm"
              className="w-full btn-persona"
              onClick={() => {
                // TODO: Handle action (navigate or open modal)
                console.log("Action clicked:", currentBubble.action);
              }}
            >
              {currentBubble.action.label || "Let's Go!"}
            </Button>
          )}
        </div>

        {/* Speech bubble tail (pointing right) */}
        <div className="speech-bubble-tail -right-2 top-6" />
      </div>
    </div>
  );
}
