"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Share2, Check, Copy, Loader2, AlertCircle } from "lucide-react";
import { createSmartLink } from "@/lib/smart-links/create";
import { track } from "@/lib/track";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  persona: string;
  defaultSubject?: string | null;
  defaultDeckId?: string;
}

const AVAILABLE_LOOPS = [
  { value: "buddy_challenge", label: "Buddy Challenge" },
  { value: "results_rally", label: "Results Rally" },
  { value: "proud_parent", label: "Proud Parent" },
  { value: "tutor_spotlight", label: "Tutor Spotlight" },
] as const;

export function InviteModal({
  open,
  onOpenChange,
  userId,
  persona: _persona,
  defaultSubject,
  defaultDeckId,
}: InviteModalProps) {
  const [loop, setLoop] = useState<string>("buddy_challenge");
  const [subject, setSubject] = useState<string>(defaultSubject || "");
  const [deckId, setDeckId] = useState<string>(defaultDeckId || "deck-1");
  const [isCreating, setIsCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(
    null
  );
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Check rate limit on mount/open
  const checkRateLimit = useCallback(async () => {
    if (open) {
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
        console.error("[InviteModal] Failed to check rate limit:", error);
      }
    }
  }, [open]);

  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setCreatedLink(null);
      setCopied(false);
      setError(null);
      setRateLimitError(null);
    }
  }, [open]);

  const handleCreateLink = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setRateLimitError(null);

      // Check rate limit before creating
      const rateLimitResponse = await fetch("/api/rate-limit/invite");
      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        if (!rateLimitData.allowed) {
          setRateLimitError(
            `Daily invite limit reached (${rateLimitData.limit} invites/day). Try again after ${new Date(rateLimitData.resetAt).toLocaleString()}.`
          );
          setIsCreating(false);
          return;
        }
        setRateLimitRemaining(rateLimitData.remaining);
      }

      // Build smart link params
      const linkParams: Record<string, unknown> = {
        deckId: deckId || "deck-1",
      };
      if (subject) linkParams.subject = subject;

      // Create smart link
      const { code, url } = await createSmartLink({
        inviterId: userId,
        loop,
        params: linkParams,
      });

      // Update remaining count
      if (rateLimitRemaining !== null) {
        setRateLimitRemaining(Math.max(0, rateLimitRemaining - 1));
      }

      setCreatedLink(url);

      // Track invite.sent event
      await track("invite.sent", {
        inviter_id: userId,
        loop,
        smart_link_code: code,
        subject: subject || undefined,
      });
    } catch (err) {
      console.error("[InviteModal] Failed to create link:", err);
      if (err instanceof Error) {
        if (err.message.includes("Rate limit")) {
          setRateLimitError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to create invite link. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdLink) return;

    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[InviteModal] Failed to copy:", error);
      setError("Failed to copy link. Please copy manually.");
    }
  };

  const handleShare = async () => {
    if (!createdLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on K-Factor!",
          text: "Check out this practice challenge!",
          url: createdLink,
        });
      } catch (error) {
        // User cancelled or error - ignore
        console.log("[InviteModal] Share cancelled or failed:", error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Create Invite Link
          </DialogTitle>
          <DialogDescription>
            Generate a smart link to invite friends to practice together
          </DialogDescription>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Your invite link
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={createdLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <Button onClick={handleShare} className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedLink(null);
                  setCopied(false);
                }}
                className="flex-1"
              >
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loop">Viral Loop</Label>
              <Select value={loop} onValueChange={setLoop}>
                <SelectTrigger id="loop">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LOOPS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., algebra, geometry"
                maxLength={64}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deckId">Deck ID (optional)</Label>
              <Input
                id="deckId"
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                placeholder="deck-1"
              />
            </div>

            {rateLimitError && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {rateLimitError}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {rateLimitRemaining !== null && !rateLimitError && (
              <p className="text-xs text-muted-foreground">
                {rateLimitRemaining} invites remaining today
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateLink}
                disabled={isCreating || rateLimitError !== null}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Create Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

