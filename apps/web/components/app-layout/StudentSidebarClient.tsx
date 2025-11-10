"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { StudentSidebar } from "./StudentSidebar";

interface StudentSidebarData {
  xp: number;
  level: number;
  streak: number;
  streakAtRisk: boolean;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
  }>;
  subjects: Array<{
    name: string;
    activeUsers: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
  }>;
  cohorts: Array<{
    id: string;
    name: string;
    subject: string;
    activeUsers: number;
  }>;
}

interface StudentSidebarClientProps {
  userId: string;
  userName: string | null | undefined;
  persona: "student" | "parent" | "tutor";
  initialData: StudentSidebarData;
}

/**
 * Client-side wrapper for StudentSidebar with auto-refresh capabilities
 * 
 * Refreshes on:
 * - challengeCompleted event (when user completes a challenge and earns XP)
 * - xpEarned event (generic XP gain)
 * - Manual interval (every 60 seconds as fallback)
 */
export const StudentSidebarClient = memo(function StudentSidebarClient({
  userId,
  userName,
  persona,
  initialData,
}: StudentSidebarClientProps) {
  const [data, setData] = useState<StudentSidebarData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Memoized refresh function
  const refreshData = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await fetch("/api/sidebar/student-data", {
        // Add cache-busting to ensure fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error("[StudentSidebarClient] Failed to refresh:", error);
      // Don't update state on error - keep showing current data
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Event-driven refresh
  useEffect(() => {
    // Listen for challenge completion events
    const handleChallengeCompleted = () => {
      console.log("[StudentSidebarClient] Challenge completed, refreshing...");
      refreshData();
    };

    // Listen for generic XP earned events
    const handleXpEarned = () => {
      console.log("[StudentSidebarClient] XP earned, refreshing...");
      refreshData();
    };

    // Listen for challenge generated (to update badges/cohorts)
    const handleChallengeGenerated = () => {
      console.log("[StudentSidebarClient] Challenge generated, refreshing...");
      refreshData();
    };

    window.addEventListener("challengeCompleted", handleChallengeCompleted);
    window.addEventListener("xpEarned", handleXpEarned);
    window.addEventListener("challengeGenerated", handleChallengeGenerated);

    return () => {
      window.removeEventListener("challengeCompleted", handleChallengeCompleted);
      window.removeEventListener("xpEarned", handleXpEarned);
      window.removeEventListener("challengeGenerated", handleChallengeGenerated);
    };
  }, [refreshData]);

  // Periodic refresh as fallback (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <StudentSidebar 
      userId={userId}
      userName={userName}
      persona={persona}
      data={data}
    />
  );
});

