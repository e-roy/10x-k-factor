"use client";

import { useEffect, useState } from "react";
import { OnboardingSheet } from "@/components/OnboardingSheet";

interface OnboardingWrapperProps {
  userId: string;
  currentPersona?: string;
  hasResults: boolean;
  hasCohorts: boolean;
}

export function OnboardingWrapper({
  userId,
  currentPersona,
  hasResults,
  hasCohorts,
}: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if user has no results and no cohorts
    if (!hasResults && !hasCohorts) {
      setShowOnboarding(true);
    }
  }, [hasResults, hasCohorts]);

  return (
    <OnboardingSheet
      open={showOnboarding}
      userId={userId}
      currentPersona={currentPersona}
    />
  );
}

