"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, AlertCircle, Mail } from "lucide-react";
import { createSmartLink } from "@/lib/smart-links/create";
import { track } from "@/lib/track";

interface ShareButtonProps {
  resultId?: string;
  userId: string;
  persona: string;
  subject?: string | null;
  deckId?: string;
  loop: string; // Required: buddy_challenge, results_rally, proud_parent, tutor_spotlight
  shareCopy?: string; // Optional personalized copy from personalize agent
  tutorId?: string; // For tutor spotlight OG cards
}

export function ShareButton({
  resultId,
  userId,
  persona: _persona,
  subject,
  deckId,
  loop,
  shareCopy,
  tutorId,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(
    null
  );

  // Generate deckId if not provided
  // Priority: provided deckId > resultId-based > default deck
  const finalDeckId = deckId || (resultId ? `deck-${resultId.slice(0, 8)}` : "deck-default");

  // Loop-specific share copy and titles
  const getLoopShareCopy = (): { title: string; text: string } => {
    if (shareCopy) {
      return {
        title: shareCopy,
        text: shareCopy,
      };
    }

    // Fallback loop-specific copy
    const loopCopy: Record<string, { title: string; text: string }> = {
      buddy_challenge: {
        title: `I just completed a ${subject || "practice"} session! Challenge me? 🎯`,
        text: `I just completed a ${subject || "practice"} session! Challenge me to beat your score? 🎯`,
      },
      results_rally: {
        title: `Check out my ${subject || "latest"} results!`,
        text: `Check out my ${subject || "latest"} results! Can you beat this? 💪`,
      },
      proud_parent: {
        title: `My child just aced their ${subject || "practice"}! So proud! 🎉`,
        text: `My child just aced their ${subject || "practice"}! So proud! 🎉 Check out their progress!`,
      },
      tutor_spotlight: {
        title: `New ${subject || "learning"} challenge ready! Join my students 🚀`,
        text: `New ${subject || "learning"} challenge ready! Join my students and level up 🚀`,
      },
    };

    return loopCopy[loop] || {
      title: "Check this out! 🎯",
      text: "Check this out! 🎯",
    };
  };

  // Check rate limit on mount
  useEffect(() => {
    async function checkRateLimit() {
      try {
        const response = await fetch("/api/rate-limit/invite");
        if (response.ok) {
          const data = await response.json();
          setRateLimitRemaining(data.remaining);
          if (!data.allowed) {
            setRateLimitError(
              `Daily invite limit reached (${data.limit} invites/day). Try again after ${new Date(data.resetAt).toLocaleString()}.`
            );
          }
        }
      } catch (error) {
        // Silently fail - rate limit check is non-blocking
        console.error("[ShareButton] Failed to check rate limit:", error);
      }
    }

    checkRateLimit();
  }, []);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setRateLimitError(null);

      // Check rate limit before creating link
      const rateLimitResponse = await fetch("/api/rate-limit/invite");
      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        if (!rateLimitData.allowed) {
          setRateLimitError(
            `Daily invite limit reached (${rateLimitData.limit} invites/day). Try again after ${new Date(rateLimitData.resetAt).toLocaleString()}.`
          );
          setIsSharing(false);
          return;
        }
        setRateLimitRemaining(rateLimitData.remaining);
      }

      // Build smart link params - always include deckId for FVM routing
      const linkParams: Record<string, unknown> = {
        deckId: finalDeckId,
      };
      if (resultId) linkParams.resultId = resultId;
      if (tutorId) linkParams.tutorId = tutorId;
      if (subject) linkParams.subject = subject;

      // Create smart link with the selected loop
      const { code, url } = await createSmartLink({
        inviterId: userId,
        loop,
        params: linkParams,
      });

      // Update remaining count after successful creation
      if (rateLimitRemaining !== null) {
        setRateLimitRemaining(Math.max(0, rateLimitRemaining - 1));
      }

      const shareCopy = getLoopShareCopy();

      // For Proud Parent, try email first (mailto: fallback)
      if (loop === "proud_parent" && !navigator.share) {
        const emailSubject = encodeURIComponent(shareCopy.title);
        const emailBody = encodeURIComponent(`${shareCopy.text}\n\n${url}`);
        const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoUrl;
        
        // Track invite.sent event
        await track("invite.sent", {
          inviter_id: userId,
          loop,
          smart_link_code: code,
          subject: subject || undefined,
        });
        return;
      }

      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareCopy.title,
            text: shareCopy.text,
            url,
          });

          // Track invite.sent event
          await track("invite.sent", {
            inviter_id: userId,
            loop,
            smart_link_code: code,
            subject: subject || undefined,
          });

          return;
        } catch (shareError) {
          // User cancelled or share failed, fall through to copy
          if ((shareError as Error).name !== "AbortError") {
            console.error("Share failed:", shareError);
          }
        }
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track invite.sent event
      await track("invite.sent", {
        inviter_id: userId,
        loop,
        smart_link_code: code,
        subject: subject || undefined,
      });
    } catch (error) {
      console.error("Failed to share:", error);

      // Handle rate limit error
      if (
        error instanceof Error &&
        (error as Error & { statusCode?: number }).statusCode === 429
      ) {
        setRateLimitError(error.message);
      } else {
        // Generic error - could show toast notification here
        setRateLimitError("Failed to create share link. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Get button text based on loop
  const getButtonText = (): string => {
    if (copied) return "Copied!";
    if (isSharing) return "Sharing...";
    
    const buttonTexts: Record<string, string> = {
      buddy_challenge: "Challenge a Friend",
      results_rally: "Share Results",
      proud_parent: "Share Progress",
      tutor_spotlight: "Share Challenge",
    };
    
    return buttonTexts[loop] || "Share";
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleShare}
        disabled={isSharing || rateLimitError !== null}
        variant="outline"
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="size-4" />
            Copied!
          </>
        ) : (
          <>
            {loop === "proud_parent" && !navigator.share ? (
              <Mail className="size-4" />
            ) : (
              <Share2 className="size-4" />
            )}
            {getButtonText()}
          </>
        )}
      </Button>
      {rateLimitError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{rateLimitError}</span>
        </div>
      )}
      {rateLimitRemaining !== null &&
        rateLimitRemaining > 0 &&
        !rateLimitError && (
          <div className="text-xs text-muted-foreground">
            {rateLimitRemaining} invite{rateLimitRemaining !== 1 ? "s" : ""}{" "}
            remaining today
          </div>
        )}
    </div>
  );
}
