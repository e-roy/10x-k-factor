"use client";

import { cn } from "@/lib/utils";
import { Flame, BookOpen, GraduationCap, Target, Zap } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RadialProgressWidgetProps {
  subject: string;
  totalXp: number;
  classesTaken: number;
  totalClasses: number;
  tutoringSessions: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  className?: string;
  onClick?: () => void;
}

export function RadialProgressWidget({
  subject,
  totalXp,
  classesTaken,
  totalClasses,
  tutoringSessions,
  challengesCompleted,
  currentStreak,
  longestStreak,
  className,
  onClick,
}: RadialProgressWidgetProps) {
  // Calculate stroke dash array for progress rings
  const outerRadius = 70;
  const innerRadius = 55; // outerRadius - 15
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  
  // Outer ring: classes taken / total classes
  const classesProgress = totalClasses > 0 ? (classesTaken / totalClasses) * 100 : 0;
  const classesOffset = outerCircumference - (classesProgress / 100) * outerCircumference;

  // Inner ring: current streak / longest streak
  const streakProgress = longestStreak > 0 ? (currentStreak / longestStreak) * 100 : 0;
  const streakOffset = innerCircumference - (streakProgress / 100) * innerCircumference;
  
  const isBestStreak = currentStreak > 0 && currentStreak === longestStreak;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative group rounded-2xl p-6 w-full",
            "border border-persona bg-persona-overlay",
            "hover:shadow-persona-lg transition-all duration-300",
            "hover:scale-105",
            className
          )}
        >
          <div className="grid grid-cols-2 gap-6 items-center">
            {/* Left Column: Radial Progress */}
            <div className="flex flex-col items-center">
              {/* SVG Progress Rings */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background circles */}
                  <circle
                    cx="80"
                    cy="80"
                    r={outerRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted opacity-20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={innerRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted opacity-20"
                  />

                  {/* Outer progress ring (classes taken / total classes) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={outerRadius}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={outerCircumference}
                    strokeDashoffset={classesOffset}
                    className="progress-ring-outer transition-all duration-500"
                    style={{
                      stroke: "rgb(var(--persona-primary))",
                    }}
                  />

                  {/* Inner progress ring (current streak / longest streak) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={innerRadius}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={innerCircumference}
                    strokeDashoffset={streakOffset}
                    className="transition-all duration-500"
                    style={{
                      stroke: isBestStreak
                        ? "#eab308" // yellow-500
                        : "rgb(var(--persona-secondary))",
                      filter: isBestStreak
                        ? "drop-shadow(0 0 4px #eab308)"
                        : "drop-shadow(0 0 4px rgb(var(--persona-secondary)))",
                    }}
                  />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold mb-1 text-persona-primary">
                    {totalXp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    XP
                  </div>
                </div>
              </div>

              {/* Subject name */}
              <h3 className="mt-4 font-semibold text-lg">{subject}</h3>
            </div>

            {/* Right Column: Detailed Stats */}
            <div className="space-y-3">
              {/* Total XP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Total XP</span>
                </div>
                <span className="text-sm font-bold">{totalXp.toLocaleString()}</span>
              </div>

              {/* Classes Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Classes</span>
                  </div>
                  <span className="text-sm font-medium">
                    {classesTaken} / {totalClasses}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-persona-primary transition-all duration-500"
                    style={{
                      width: `${classesProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Streak Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame
                      className={cn(
                        "h-4 w-4",
                        isBestStreak
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      )}
                    />
                    <span className="text-sm">Streak</span>
                    {isBestStreak && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                        Best!
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isBestStreak && "text-yellow-600 dark:text-yellow-400"
                    )}
                  >
                    {currentStreak} / {longestStreak}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isBestStreak ? "bg-yellow-500" : "bg-persona-secondary"
                    )}
                    style={{
                      width: `${streakProgress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Tutoring Sessions & Challenges */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Tutoring Sessions
                    </span>
                  </div>
                  <p className="text-lg font-bold">{tutoringSessions}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Challenges
                    </span>
                  </div>
                  <p className="text-lg font-bold">{challengesCompleted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="glow-persona absolute inset-0 rounded-2xl -z-10" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-64"
        align="center"
        side="top"
        style={{
          backgroundColor: `rgb(var(--persona-primary) / 0.95)`,
          borderColor: `rgb(var(--persona-secondary))`,
          borderWidth: "2px",
        }}
      >
        <p className="text-sm text-center text-white font-medium">
          Click for a quick practice!
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

