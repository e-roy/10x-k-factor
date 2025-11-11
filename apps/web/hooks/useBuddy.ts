import { useState, useEffect } from "react";
import { usePersona } from "@/components/PersonaProvider";

export interface BuddyData {
  userId: string;
  archetype: string;
  appearance: {
    skin: string;
    aura: string;
    spriteUrl?: string;
  };
  state: {
    mood: "calm" | "fired_up" | "focused";
    energy: number;
  };
  level: number;
  xp: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook to fetch and manage agent buddy data (STUDENTS ONLY)
 * Returns null buddy for non-students without making API calls
 */
export function useBuddy() {
  const persona = usePersona();
  const [buddy, setBuddy] = useState<BuddyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch buddy for students
    if (persona !== "student") {
      setIsLoading(false);
      return;
    }

    async function fetchBuddy() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/buddy");
        
        if (response.ok) {
          const data = await response.json();
          setBuddy(data);
        } else if (response.status === 401) {
          setError("Unauthorized");
        } else if (response.status === 403) {
          // 403 means not a student - this is expected for tutors/parents
          // Don't set error, just return null buddy
          setBuddy(null);
        } else {
          setError("Failed to load buddy");
        }
      } catch (err) {
        console.error("[useBuddy] Error fetching buddy:", err);
        setError("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBuddy();
  }, [persona]);

  const refresh = async () => {
    // Only refresh for students
    if (persona !== "student") {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buddy");
      if (response.ok) {
        const data = await response.json();
        setBuddy(data);
      } else if (response.status === 403) {
        // 403 means not a student - expected for tutors/parents
        setBuddy(null);
      } else {
        setError("Failed to refresh buddy");
      }
    } catch (err) {
      console.error("[useBuddy] Error refreshing buddy:", err);
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buddy,
    isLoading,
    error,
    refresh,
  };
}

