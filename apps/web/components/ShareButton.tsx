"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
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

  // Generate deckId if not provided (use resultId as deckId for now)
  // In production, this might come from result metadata or be generated
  const finalDeckId = deckId || `deck-${resultId.slice(0, 8)}`;

  const handleShare = async () => {
    try {
      setIsSharing(true);

      // Create smart link
      const { code, url } = await createSmartLink({
        inviterId: userId,
        loop: "results_rally",
        params: {
          resultId,
          deckId: finalDeckId,
        },
      });

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
      // Could show toast notification here
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isSharing}
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
  );
}
