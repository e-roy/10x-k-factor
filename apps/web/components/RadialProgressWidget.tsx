"use client";

import { cn } from "@/lib/utils";

interface RadialProgressWidgetProps {
  subject: string;
  progress: number; // 0-100
  level: number;
  xp: number;
  xpToNextLevel: number;
  className?: string;
  onClick?: () => void;
}

export function RadialProgressWidget({
  subject,
  progress,
  level,
  xp,
  xpToNextLevel,
  className,
  onClick,
}: RadialProgressWidgetProps) {
  // Calculate stroke dash array for progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // XP progress to next level
  const xpProgress = (xp / xpToNextLevel) * 100;
  const xpOffset = circumference - (xpProgress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group rounded-2xl p-6",
        "border border-persona bg-persona-overlay",
        "hover:shadow-persona-lg transition-all duration-300",
        "hover:scale-105",
        className
      )}
    >
      {/* SVG Progress Rings */}
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circles */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted opacity-20"
          />
          <circle
            cx="80"
            cy="80"
            r={radius - 15}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted opacity-20"
          />

          {/* Outer progress ring (subject progress) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring-outer transition-all duration-500"
          />

          {/* Inner progress ring (XP to next level) */}
          <circle
            cx="80"
            cy="80"
            r={radius - 15}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={xpOffset}
            className="progress-ring-inner transition-all duration-500"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold mb-1 text-persona-primary">
            {level}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Level
          </div>
        </div>
      </div>

      {/* Subject name */}
      <div className="mt-4 text-center">
        <h3 className="font-semibold text-lg">{subject}</h3>
        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% Complete
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {xp} / {xpToNextLevel} XP
        </p>
      </div>

      {/* Hover glow effect */}
      <div className="glow-persona absolute inset-0 rounded-2xl -z-10" />
    </button>
  );
}

