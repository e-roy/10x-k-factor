"use client";

import { cn } from "@/lib/utils";
import { Flame, Zap, GraduationCap } from "lucide-react";

interface TutorProgressWidgetProps {
  subject: string;
  totalXp: number;
  tutoringSessions: number;
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function TutorProgressWidget({
  subject,
  totalXp,
  tutoringSessions,
  currentStreak,
  longestStreak,
  className,
}: TutorProgressWidgetProps) {
  const isBestStreak = currentStreak > 0 && currentStreak === longestStreak;

  return (
    <div
      className={cn(
        "relative group rounded-2xl p-6 w-full",
        "border border-persona bg-persona-overlay",
        "hover:shadow-persona-lg transition-all duration-300",
        "hover:scale-105",
        className
      )}
    >
      <div className="space-y-4">
        {/* Subject name at top */}
        <h3 className="font-semibold text-xl text-center">{subject}</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          {/* Total XP */}
          <div className="flex flex-col items-center space-y-1">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div className="text-2xl font-bold text-persona-primary">
              {totalXp.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              XP
            </div>
          </div>

          {/* Tutoring Sessions */}
          <div className="flex flex-col items-center space-y-1">
            <GraduationCap className="h-5 w-5 text-persona-primary" />
            <div className="text-2xl font-bold text-persona-primary">
              {tutoringSessions}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide text-center">
              Sessions
            </div>
          </div>

          {/* Current Streak */}
          <div className="flex flex-col items-center space-y-1">
            <Flame
              className={cn(
                "h-5 w-5",
                isBestStreak ? "text-yellow-500" : "text-orange-500"
              )}
            />
            <div
              className={cn(
                "text-2xl font-bold",
                isBestStreak
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-orange-600 dark:text-orange-400"
              )}
            >
              {currentStreak}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide text-center">
              {isBestStreak ? "Best!" : "Streak"}
            </div>
          </div>
        </div>

        {/* Longest Streak Indicator (if different from current) */}
        {!isBestStreak && longestStreak > 0 && (
          <div className="text-center text-xs text-muted-foreground border-t pt-2">
            Longest streak: {longestStreak} days
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="glow-persona absolute inset-0 rounded-2xl -z-10" />
    </div>
  );
}

