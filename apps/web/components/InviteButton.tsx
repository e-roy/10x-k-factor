"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InviteModal } from "@/components/InviteModal";
import { Share2 } from "lucide-react";

interface InviteButtonProps {
  userId: string;
  persona: string;
  defaultSubject?: string | null;
  defaultDeckId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function InviteButton({
  userId,
  persona,
  defaultSubject,
  defaultDeckId,
  variant = "default",
  size = "default",
  className,
  children,
}: InviteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children || (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Invite a friend
          </>
        )}
      </Button>
      <InviteModal
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        persona={persona}
        defaultSubject={defaultSubject}
        defaultDeckId={defaultDeckId}
      />
    </>
  );
}

