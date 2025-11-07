"use client";

import { useEffect, useState } from "react";
import { OnboardingSheet } from "@/components/OnboardingSheet";

interface OnboardingWrapperProps {
  userId: string;
  currentPersona?: string;
  onboardingCompleted: boolean;
}

export function OnboardingWrapper({
  userId,
  currentPersona,
  onboardingCompleted,
}: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if user hasn't completed it yet
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [onboardingCompleted]);

  return (
    <OnboardingSheet
      open={showOnboarding}
      userId={userId}
      currentPersona={currentPersona}
      onClose={() => setShowOnboarding(false)}
    />
  );
}

