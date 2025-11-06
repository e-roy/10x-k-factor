"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
  userName?: string;
}

interface LeaderboardWidgetProps {
  subject: string;
  limit?: number;
  showCurrentUser?: boolean;
  currentUserId?: string;
  className?: string;
}

export function LeaderboardWidget({
  subject,
  limit = 10,
  showCurrentUser = false,
  currentUserId,
  className,
}: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<{
    rank: number;
    score: number;
  } | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!subject || subject.trim().length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch leaderboard
        const response = await fetch(
          `/api/leaderboard/${encodeURIComponent(subject)}?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        const data = await response.json();
        setEntries(data.entries || []);

        // Fetch current user's rank if requested
        if (showCurrentUser && currentUserId) {
          // For now, check if current user is in the entries
          // In a full implementation, we'd fetch the user's rank separately
          const userEntry = data.entries.find(
            (e: LeaderboardEntry) => e.userId === currentUserId
          );
          if (userEntry) {
            setCurrentUserRank({
              rank: userEntry.rank,
              score: userEntry.score,
            });
          }
        }
      } catch (err) {
        console.error("[LeaderboardWidget] Error fetching leaderboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [subject, limit, showCurrentUser, currentUserId]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
    if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    }
    if (rank === 3) {
      return <Award className="h-5 w-5 text-amber-600" />;
    }
    return null;
  };

  const getRankDisplay = (rank: number) => {
    if (rank <= 3) {
      return null; // Use icon instead
    }
    return `#${rank}`;
  };

  if (!subject || subject.trim().length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard: {subject}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-4 text-muted-foreground">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No entries yet. Be the first!
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.userId === currentUserId
                    ? "bg-primary/5 border-primary"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 shrink-0">
                    {getRankIcon(entry.rank) || (
                      <span className="text-sm font-medium text-muted-foreground">
                        {getRankDisplay(entry.rank)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {entry.userName || `User ${entry.userId.slice(0, 8)}`}
                      {entry.userId === currentUserId && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">{entry.score}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}

            {showCurrentUser &&
              currentUserId &&
              currentUserRank &&
              !entries.find((e) => e.userId === currentUserId) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{currentUserRank.rank}
                      </span>
                      <div className="font-medium">Your rank</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{currentUserRank.score}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

