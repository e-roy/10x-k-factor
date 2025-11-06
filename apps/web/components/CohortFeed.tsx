"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, CheckCircle } from "lucide-react";

interface FeedEvent {
  id: number;
  name: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  props: Record<string, unknown>;
}

interface CohortFeedProps {
  cohortId: string;
  subject: string | null;
  createdBy: string;
  limit?: number;
}

export function CohortFeed({
  cohortId,
  subject,
  createdBy,
  limit = 20,
}: CohortFeedProps) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams({
          cohortId,
          limit: limit.toString(),
        });
        if (subject) {
          params.set("subject", subject);
        }
        params.set("createdBy", createdBy);

        const response = await fetch(`/api/cohort/${cohortId}/feed?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("[CohortFeed] Error fetching feed:", err);
        setError(err instanceof Error ? err.message : "Failed to load feed");
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [cohortId, subject, createdBy, limit]);

  const formatEvent = (event: FeedEvent) => {
    const userName = event.userName || `User ${event.userId?.slice(0, 8) || "Unknown"}`;
    const timestamp = new Date(event.timestamp);
    const timeAgo = formatTimeAgo(timestamp);

    switch (event.name) {
      case "invite.joined":
        return {
          icon: <Users className="h-4 w-4 text-blue-500" />,
          message: `${userName} joined`,
          time: timeAgo,
        };
      case "invite.fvm":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          message: `${userName} completed the challenge`,
          time: timeAgo,
        };
      default:
        return {
          icon: null,
          message: `${userName} ${event.name}`,
          time: timeAgo,
        };
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "just now";
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive text-sm">{error}</div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet. Be the first to join!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const formatted = formatEvent(event);
        return (
          <div
            key={event.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
          >
            {formatted.icon && <div className="shrink-0">{formatted.icon}</div>}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{formatted.message}</div>
              <div className="text-xs text-muted-foreground">
                {formatted.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

