"use client";

import { CohortSwitcher } from "@/components/CohortSwitcher";
import { PresencePill } from "@/components/PresencePill";
import { UserMenu } from "@/components/app-layout/UserMenu";
import { Command } from "lucide-react";
import { useCohort } from "@/components/app-layout/CohortContext";

interface HeaderContentProps {
  userId: string;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
}

export function HeaderContent({
  userId,
  userName,
  userEmail,
  userImage,
}: HeaderContentProps) {
  const { selectedCohortSubject } = useCohort();

  return (
    <>
      <CohortSwitcher userId={userId} />
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded border border-transparent hover:border-border transition-colors"
          title="Command palette (⌘K)"
        >
          <Command className="h-3.5 w-3.5" />
          <kbd className="hidden sm:inline-block">⌘K</kbd>
        </button>
        <PresencePill subject={selectedCohortSubject || "algebra"} />
        
        <UserMenu name={userName} email={userEmail} image={userImage} />
      </div>
    </>
  );
}
