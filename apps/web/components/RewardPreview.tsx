"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";

interface RewardPreviewProps {
  loop?: string;
  rewardType?: string;
  rewardAmount?: string;
}

/**
 * RewardPreview component - shows preview of reward that will be granted
 * (Actual grant happens in Phase 10)
 */
export function RewardPreview({
  loop,
  rewardType,
  rewardAmount,
}: RewardPreviewProps) {
  // Determine reward text based on loop or provided props
  let rewardText = "You'll receive a reward!";
  
  if (rewardType && rewardAmount) {
    rewardText = `You'll receive: ${rewardAmount} ${rewardType}`;
  } else if (loop === "buddy_challenge") {
    rewardText = "You'll receive: +15 AI minutes";
  } else if (loop === "streak_rescue") {
    rewardText = "You'll receive: Streak Shield";
  } else {
    // Default reward
    rewardText = "You'll receive: +15 AI minutes";
  }

  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Sparkles className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">
        Reward Unlocked!
      </AlertTitle>
      <AlertDescription className="mt-1">
        {rewardText}
      </AlertDescription>
    </Alert>
  );
}

