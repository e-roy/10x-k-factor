"use client";

import { usePresence } from "@/hooks/usePresence";
import { Users } from "lucide-react";

interface PresencePillProps {
  className?: string;
}

export function PresencePill({ className }: PresencePillProps) {
  // Use special "app" subject for whole-app presence tracking
  const { count, isConnected } = usePresence("app");

  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className || ""}`}
    >
      <Users className="h-3.5 w-3.5" />
      <span>
        {count === 0
          ? "No peers online"
          : count === 1
            ? "1 peer online"
            : `${count} peers online`}
      </span>
      {!isConnected && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-yellow-500"
          title="Reconnecting..."
        />
      )}
    </div>
  );
}

