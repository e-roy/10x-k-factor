"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Clock, BookOpen } from "lucide-react";

interface Session {
  id: string;
  subject: string;
  scheduledAt: Date;
  duration: number; // minutes
}

interface TutorDashboardProps {
  user: {
    id: string;
    name?: string | null;
    persona: string;
  };
  xp: number;
  streak: number;
  sessions: Session[];
}

export function TutorDashboard({
  user,
  xp,
  streak,
  sessions,
}: TutorDashboardProps) {
  // Format date/time for display
  const formatSessionTime = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday =
      d.toDateString() === today.toDateString();
    const isTomorrow =
      d.toDateString() === tomorrow.toDateString();

    let dateStr = "";
    if (isToday) {
      dateStr = "Today";
    } else if (isTomorrow) {
      dateStr = "Tomorrow";
    } else {
      dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { dateStr, timeStr };
  };

  // Sort sessions by scheduled time
  const sortedSessions = [...sessions].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Manage your tutoring sessions and track your progress
        </p>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* XP Card */}
          <Card className="card-persona">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-persona-primary">
                <Zap className="h-5 w-5" />
                Total XP
              </CardTitle>
              <CardDescription>Your tutoring experience points</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{xp.toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {streak} Day Streak
              </CardTitle>
              <CardDescription>
                {streak === 0
                  ? "Start your streak today!"
                  : "Keep up the great work!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-500">{streak}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Sessions Section */}
      <section className="w-1/2">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        {sortedSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No upcoming sessions scheduled.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedSessions.map((session) => {
              const { dateStr, timeStr } = formatSessionTime(session.scheduledAt);
              return (
                <Card key={session.id} className="card-persona">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Subject */}
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{session.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {dateStr} at {timeStr}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">
                          {session.duration} min
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

