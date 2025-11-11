"use client";

import { useAgentBuddy } from "@/hooks/useAgentBuddy";
import { useModal } from "@/components/ModalManager";
import { X } from "lucide-react";
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

// Random encouraging messages for when there are no notifications
const ENCOURAGING_MESSAGES = [
  "You're doing great! Keep up the amazing work! 💪",
  "Every step forward is progress. You've got this! 🌟",
  "Your dedication is inspiring! Keep pushing forward! 🚀",
  "You're on the right track! Keep learning and growing! 📚",
  "Remember, every expert was once a beginner. Keep going! ✨",
  "You're building something amazing. Don't stop now! 🎯",
  "Your hard work is paying off! Keep it up! 🏆",
  "You're stronger than you think. Keep pushing! 💎",
  "Every challenge you face makes you stronger! 🌈",
  "You're making progress every single day! Keep it up! ⭐",
  "Believe in yourself - you're capable of amazing things! 🌟",
  "Your journey is unique and valuable. Keep going! 🎨",
];

/**
 * Get a random encouraging message
 */
function getRandomEncouragingMessage(): string {
  return ENCOURAGING_MESSAGES[
    Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)
  ];
}

export function AgentBuddy({ userId, persona, className }: AgentBuddyProps) {
  const { openModal } = useModal();
  const { currentBubble, bubbleCount } = useAgentBuddy({
    userId,
    persona,
    currentContext: {
      page: "dashboard",
      // These would be set dynamically based on user actions
    },
  });
  
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [encouragingMessage, setEncouragingMessage] = useState<string | null>(null);

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

  const handleBuddyClick = () => {
    // If there are notifications/challenges, toggle the bubble visibility
    if (bubbleCount > 0) {
      setBubbleVisible((prev) => !prev);
      setEncouragingMessage(null);
    } else if (persona === "student") {
      // If no notifications, show a random encouraging message
      if (encouragingMessage) {
        // If already showing, hide it
        setEncouragingMessage(null);
        setBubbleVisible(false);
      } else {
        // Show new random message
        setEncouragingMessage(getRandomEncouragingMessage());
        setBubbleVisible(true);
      }
    }
  };

  // Determine what to show in the bubble
  const bubbleContent = currentBubble || (encouragingMessage ? {
    id: "encouraging",
    copy: encouragingMessage,
    priority: "low" as const,
  } : null);

  return (
    <div className={cn("relative", className)}>
      {/* Agent buddy avatar - clickable to toggle bubble */}
      <button
        onClick={handleBuddyClick}
        className="relative"
        title={bubbleCount > 0 ? "Toggle Agent Buddy messages" : "Get encouragement"}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full overflow-hidden border-2 transition-all",
            currentBubble && bubbleCount > 0
              ? "border-persona animate-pulse shadow-persona"
              : "border-muted hover:border-persona"
          )}
        >
          <Image
            width={64}
            height={64}
            src={
              currentBubble && bubbleCount > 0
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

        {/* Pulse indicator for new messages - only show for actual notifications */}
        {currentBubble && bubbleCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-persona-primary opacity-75"></span>
          </span>
        )}
      </button>

      {/* Speech bubble */}
      {bubbleContent && bubbleVisible && (
        <div
          className={cn(
            "absolute top-0 right-full mr-3 w-72 p-4 rounded-2xl shadow-persona z-50",
            "border-2 border-persona",
            "bg-background/95 backdrop-blur-md",
            "animate-in slide-in-from-right-5 fade-in duration-300"
          )}
          style={{
            boxShadow: "0 0 0 1px hsl(var(--persona-primary) / 0.1), 0 10px 40px -10px hsl(var(--persona-primary) / 0.3)",
          }}
        >
          {/* Close button (hides but doesn't dismiss) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setBubbleVisible(false);
              setEncouragingMessage(null);
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            title="Close (click buddy to reopen)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Speech bubble content */}
          <div className="space-y-3">
            <p className="text-sm font-medium pr-6">{bubbleContent.copy}</p>

            {/* Reward preview - only show for actual bubbles, not encouraging messages */}
            {currentBubble?.rewardPreview && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/80 p-2 rounded border border-border/50">
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

            {/* Action button - only show for actual bubbles, not encouraging messages */}
            {currentBubble?.action && (
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
