"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, AlertCircle } from "lucide-react";
import { createSmartLink } from "@/lib/smart-links/create";
import { track } from "@/lib/track";

interface ShareButtonProps {
  resultId: string;
  userId: string;
  persona: string;
  subject?: string | null;
  deckId?: string;
}

export function ShareButton({
  resultId,
  userId,
  persona: _persona,
  subject,
  deckId,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(
    null
  );

  // Generate deckId if not provided (use resultId as deckId for now)
  // In production, this might come from result metadata or be generated
  const finalDeckId = deckId || `deck-${resultId.slice(0, 8)}`;

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

      // Create smart link
      const { code, url } = await createSmartLink({
        inviterId: userId,
        loop: "results_rally",
        params: {
          resultId,
          deckId: finalDeckId,
        },
      });

      // Update remaining count after successful creation
      if (rateLimitRemaining !== null) {
        setRateLimitRemaining(Math.max(0, rateLimitRemaining - 1));
      }

      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: `My ${subject || "test"} results`,
            text: `Check out my results!`,
            url,
          });

          // Track invite.sent event
          await track("invite.sent", {
            inviter_id: userId,
            loop: "results_rally",
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
        loop: "results_rally",
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
            <Share2 className="size-4" />
            {isSharing ? "Sharing..." : "Share Results"}
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
