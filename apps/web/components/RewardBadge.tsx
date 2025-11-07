"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Coins } from "lucide-react";

interface RewardBalances {
  streak_shield: number;
  ai_minutes: number;
  credits: number;
}

export function RewardBadge() {
  const [balances, setBalances] = useState<RewardBalances>({
    streak_shield: 0,
    ai_minutes: 0,
    credits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalances() {
      try {
        const response = await fetch("/api/rewards/balances");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.balances) {
            setBalances(data.balances);
          }
        }
      } catch (error) {
        console.error("[RewardBadge] Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, []);

  if (loading) {
    return null;
  }

  const hasRewards = balances.streak_shield > 0 || balances.ai_minutes > 0 || balances.credits > 0;

  if (!hasRewards) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {balances.streak_shield > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          <span>{balances.streak_shield} Shield{balances.streak_shield !== 1 ? "s" : ""}</span>
        </Badge>
      )}
      {balances.ai_minutes > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>{balances.ai_minutes} min</span>
        </Badge>
      )}
      {balances.credits > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Coins className="h-3 w-3" />
          <span>{balances.credits} Credits</span>
        </Badge>
      )}
    </div>
  );
}

