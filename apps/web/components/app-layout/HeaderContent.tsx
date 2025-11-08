"use client";

import { PresencePill } from "@/components/PresencePill";
import { UserMenu } from "@/components/app-layout/UserMenu";
import { Command } from "lucide-react";

interface HeaderContentProps {
  userId: string;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
}

export function HeaderContent({
  // userId,
  userName,
  userEmail,
  userImage,
}: HeaderContentProps) {
  return (
    <>
      {/* Placeholder for future content */}
      <div className="flex items-center gap-2" />
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded border border-transparent hover:border-border transition-colors"
          title="Command palette (⌘K)"
        >
          <Command className="h-3.5 w-3.5" />
          <kbd className="hidden sm:inline-block">⌘K</kbd>
        </button>
        <PresencePill />

        <UserMenu name={userName} email={userEmail} image={userImage} />
      </div>
    </>
  );
}
