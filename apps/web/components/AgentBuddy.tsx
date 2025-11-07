"use client";

import { useAgentBuddy } from "@/hooks/useAgentBuddy";
import { useModal } from "@/components/ModalManager";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";

interface AgentBuddyProps {
  userId: string;
  persona: "student" | "parent" | "tutor";
  className?: string;
}

export function AgentBuddy({ userId, persona, className }: AgentBuddyProps) {
  const { openModal } = useModal();
  const { currentBubble, bubbleCount, isVisible, dismissBubble, toggleVisibility } = useAgentBuddy({
    userId,
    persona,
    currentContext: {
      page: "dashboard",
      // These would be set dynamically based on user actions
    },
  });
  
  const [bubbleVisible, setBubbleVisible] = useState(true);

  const handleActionClick = () => {
    if (!currentBubble?.action) return;
    
    if (currentBubble.action.type === "modal") {
      // Trigger modal open via context
      openModal(currentBubble.action.target, currentBubble.action.data);
    } else if (currentBubble.action.type === "navigate") {
      // Navigate to target
      window.location.href = currentBubble.action.target;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Agent buddy avatar - clickable to toggle bubble */}
      <button
        onClick={() => setBubbleVisible((prev) => !prev)}
        className="relative"
        title="Toggle Agent Buddy messages"
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full overflow-hidden border-2 transition-all",
            currentBubble
              ? "border-persona animate-pulse shadow-persona"
              : "border-muted hover:border-persona"
          )}
        >
          <Image
            width={64}
            height={64}
            src={
              currentBubble
                ? "/icons/agent-buddy-active.svg"
                : "/icons/agent-buddy-idle.svg"
            }
            alt="Agent Buddy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Notification badge */}
        {bubbleCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-background"
            variant="destructive"
          >
            {bubbleCount > 9 ? "9+" : bubbleCount}
          </Badge>
        )}

        {/* Pulse indicator for new messages */}
        {currentBubble && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-persona-primary opacity-75"></span>
          </span>
        )}
      </button>

      {/* Speech bubble */}
      {currentBubble && bubbleVisible && (
        <div
          className={cn(
            "absolute top-0 right-full mr-3 w-72 p-4 rounded-2xl shadow-persona z-50",
            "border border-persona bg-persona-overlay",
            "animate-in slide-in-from-right-5 fade-in duration-300"
          )}
        >
          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissBubble(currentBubble.id);
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            title="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Speech bubble content */}
          <div className="space-y-3">
            <p className="text-sm font-medium pr-6">{currentBubble.copy}</p>

            {/* Reward preview */}
            {currentBubble.rewardPreview && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded">
                <span className="text-base">
                  {currentBubble.rewardPreview.type === "streak_shield"
                    ? "🛡️"
                    : currentBubble.rewardPreview.type === "ai_minutes"
                      ? "🤖"
                      : currentBubble.rewardPreview.type === "badge"
                        ? "🏆"
                        : currentBubble.rewardPreview.type === "xp"
                          ? "✨"
                          : "💎"}
                </span>
                <span className="flex-1">{currentBubble.rewardPreview.description}</span>
              </div>
            )}

            {/* Action button */}
            {currentBubble.action && (
              <Button
                size="sm"
                className="w-full btn-persona"
                onClick={handleActionClick}
              >
                {currentBubble.action.label || "Let&#x27;s Go!"}
              </Button>
            )}
          </div>

          {/* Speech bubble tail (pointing right) */}
          <div className="speech-bubble-tail -right-2 top-6" />
        </div>
      )}
    </div>
  );
}
