"use client";

import { useEffect, useState } from "react";
import { Coins, Shield, Clock, Loader2 } from "lucide-react";

interface RewardBalances {
  streak_shield: number;
  ai_minutes: number;
  credits: number;
}

export function RewardsBalances() {
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
        console.error("[RewardsBalances] Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Streak Shield</p>
          <p className="text-2xl font-bold">{balances.streak_shield}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">AI Minutes</p>
          <p className="text-2xl font-bold">{balances.ai_minutes}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Coins className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Credits</p>
          <p className="text-2xl font-bold">{balances.credits}</p>
        </div>
      </div>
    </div>
  );
}

