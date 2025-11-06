"use client";

import { usePresence } from "@/hooks/usePresence";
import { Users } from "lucide-react";

interface PresenceWidgetProps {
  subject: string | null | undefined;
  className?: string;
}

export function PresenceWidget({ subject, className }: PresenceWidgetProps) {
  const { count, isConnected } = usePresence(subject);

  // Don't render if no subject
  if (!subject || subject.trim().length === 0) {
    console.log("No subject");
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm text-muted-foreground ${className || ""}`}
    >
      <Users className="h-4 w-4" />
      <span>
        {count === 0
          ? "No one viewing"
          : count === 1
            ? "1 person viewing"
            : `${count} people viewing`}
      </span>
      {!isConnected && (
        <span
          className="h-2 w-2 rounded-full bg-yellow-500"
          title="Reconnecting..."
        />
      )}
    </div>
  );
}
