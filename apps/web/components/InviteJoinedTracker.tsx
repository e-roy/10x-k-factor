"use client";

import { useEffect } from "react";

/**
 * Client component to track invite.joined event after user signs in
 * This should be placed in a layout or page that loads after authentication
 */
export function InviteJoinedTracker() {
  useEffect(() => {
    // Call the API to track invite.joined if attribution cookie exists
    fetch("/api/attribution/track-joined", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((error) => {
      // Silently fail - tracking should never break the app
      console.error("[InviteJoinedTracker] Failed to track invite.joined:", error);
    });
  }, []);

  return null; // This component doesn't render anything
}

