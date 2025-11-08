"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/components/ModalManager";

/**
 * Client component that opens the challenge modal when URL contains openChallenge param
 * Used for authenticated users clicking challenge share links
 */
export function ChallengeModalOpener() {
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  useEffect(() => {
    const challengeId = searchParams.get("openChallenge");
    const smartLinkCode = searchParams.get("sl");

    if (challengeId) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        openModal("ChallengeModal", { challengeId });

        // Track attribution if smart link code present
        if (smartLinkCode) {
          // Store attribution for later tracking
          try {
            fetch("/api/attribution/track-joined", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                smartLinkCode,
                challengeId,
              }),
            }).catch((error) => {
              console.error("[ChallengeModalOpener] Failed to track attribution:", error);
            });
          } catch (error) {
            console.error("[ChallengeModalOpener] Attribution error:", error);
          }
        }

        // Clean up URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete("openChallenge");
        url.searchParams.delete("sl");
        window.history.replaceState({}, "", url.toString());
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, openModal]);

  return null;
}

