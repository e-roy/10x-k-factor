"use client";

import { usePresence } from "@/hooks/usePresence";
import { Users } from "lucide-react";

interface PresencePillProps {
  subject: string | null | undefined;
  className?: string;
}

export function PresencePill({ subject, className }: PresencePillProps) {
  const { count, isConnected } = usePresence(subject);

  // Don't render if no subject
  if (!subject || subject.trim().length === 0) {
    return (
      <div className={`text-xs text-muted-foreground ${className || ""}`}>
        No subject selected
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className || ""}`}
    >
      <Users className="h-3.5 w-3.5" />
      <span>
        {count === 0
          ? "No one practicing"
          : count === 1
            ? "1 peer practicing"
            : `${count} peers practicing`}
      </span>
      {subject && (
        <span className="text-muted-foreground/70">
          {subject}
        </span>
      )}
      {!isConnected && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-yellow-500"
          title="Reconnecting..."
        />
      )}
    </div>
  );
}

