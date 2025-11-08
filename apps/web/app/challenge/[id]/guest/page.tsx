"use client";

import { use, useState, useEffect } from "react";
import { GuestChallengeFlow } from "@/components/GuestChallengeFlow";

interface GuestChallengePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sl?: string }>;
}

/**
 * Guest challenge completion page
 * Allows unauthenticated users to complete challenges
 * Results are stored temporarily and converted on signup
 */
export default function GuestChallengePage(props: GuestChallengePageProps) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Generate or retrieve guest session ID
  useEffect(() => {
    let sessionId = localStorage.getItem("guest_session_id");
    if (!sessionId) {
      // Generate new session ID (simple UUID-like)
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("guest_session_id", sessionId);
    }
    setGuestSessionId(sessionId);
  }, []);

  if (!guestSessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <GuestChallengeFlow
      challengeId={params.id}
      guestSessionId={guestSessionId}
      smartLinkCode={searchParams.sl}
    />
  );
}

