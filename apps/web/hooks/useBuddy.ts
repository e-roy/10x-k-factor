import { useState, useEffect } from "react";

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
 * Hook to fetch and manage agent buddy data
 */
export function useBuddy() {
  const [buddy, setBuddy] = useState<BuddyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuddy() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/buddy");
        
        if (response.ok) {
          const data = await response.json();
          setBuddy(data);
        } else if (response.status === 401) {
          setError("Unauthorized");
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
  }, []);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buddy");
      if (response.ok) {
        const data = await response.json();
        setBuddy(data);
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

