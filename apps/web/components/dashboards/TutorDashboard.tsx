"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flame, Zap, Clock, BookOpen, Save, Loader2 } from "lucide-react";
import { TutorProgressWidget } from "./TutorProgressWidget";
import { useToast } from "@/components/ui/use-toast";

interface Session {
  id: string;
  subject: string;
  scheduledAt: Date;
  duration: number; // minutes
}

interface TutorSession {
  id: string;
  subject: string;
  summary: string;
  transcript: string;
  tutorNotes: string | null;
  duration: number | null;
  createdAt: Date | string;
  student: {
    firstName: string;
    lastName: string;
  };
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
  tutorSessions: TutorSession[];
  subjects: Array<{
    name: string;
    totalXp: number;
    tutoringSessions: number;
    currentStreak: number;
    longestStreak: number;
  }>;
}

export function TutorDashboard({
  user,
  xp,
  streak,
  sessions,
  tutorSessions: initialTutorSessions,
  subjects,
}: TutorDashboardProps) {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [tutorSessions, setTutorSessions] = useState<TutorSession[]>(initialTutorSessions);

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

  // Format date for tutor sessions
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get student name (first name + last initial)
  const getStudentName = (session: TutorSession) => {
    const firstName = session.student.firstName || "Student";
    const lastInitial = session.student.lastName?.[0]?.toUpperCase() || "";
    return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
  };

  // Handle tutor notes edit
  const handleNotesChange = (sessionId: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [sessionId]: value }));
  };

  // Save tutor notes
  const handleSaveNotes = async (sessionId: string) => {
    const notes = editingNotes[sessionId] ?? "";
    setSavingNotes((prev) => ({ ...prev, [sessionId]: true }));

    try {
      const response = await fetch("/api/tutor-sessions/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tutorNotes: notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to save notes");
      }

      toast({
        title: "Notes saved",
        description: "Your tutor notes have been saved successfully.",
      });

      // Update the session's tutorNotes in local state
      setTutorSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, tutorNotes: notes }
            : session
        )
      );

      // Clear the editing state
      setEditingNotes((prev) => {
        const updated = { ...prev };
        delete updated[sessionId];
        return updated;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingNotes((prev) => {
        const updated = { ...prev };
        delete updated[sessionId];
        return updated;
      });
    }
  };

  // Sort sessions by scheduled time
  const sortedSessions = [...sessions].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  );

  // Sort tutor sessions by creation date (newest first)
  const sortedTutorSessions = [...tutorSessions].sort((a, b) => {
    const dateA = typeof a.createdAt === "string" ? new Date(a.createdAt) : a.createdAt;
    const dateB = typeof b.createdAt === "string" ? new Date(b.createdAt) : b.createdAt;
    return dateB.getTime() - dateA.getTime();
  });

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

      {/* Progress Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <TutorProgressWidget
              key={subject.name}
              subject={subject.name}
              totalXp={subject.totalXp}
              tutoringSessions={subject.tutoringSessions}
              currentStreak={subject.currentStreak}
              longestStreak={subject.longestStreak}
            />
          ))}
        </div>
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

      {/* Sessions Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div>
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
        </div>

        {/* Tutor Sessions History */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
          {sortedTutorSessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No tutoring sessions yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedTutorSessions.map((session) => {
                const currentNotes = editingNotes[session.id] ?? session.tutorNotes ?? "";
                const hasChanges = currentNotes !== (session.tutorNotes ?? "");
                const isSaving = savingNotes[session.id] ?? false;

                return (
                  <Card key={session.id} className="card-persona">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {session.subject}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(session.createdAt)}
                            {session.duration && ` • ${session.duration} min`}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {getStudentName(session)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Summary */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{session.summary}</p>
                      </div>

                      {/* Transcript Accordion */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`transcript-${session.id}`}>
                          <AccordionTrigger className="text-sm">
                            View Transcript
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {session.transcript}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Tutor Notes */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Tutor Notes</h4>
                        <Textarea
                          value={currentNotes}
                          onChange={(e) => handleNotesChange(session.id, e.target.value)}
                          placeholder="Add notes about this session..."
                          className="min-h-24"
                        />
                        {hasChanges && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(session.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Notes
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

