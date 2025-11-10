"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, BookOpen, Zap } from "lucide-react";

interface StudentData {
  id: string;
  name: string | null;
  subjects: Array<{
    name: string;
    totalXp: number;
    classesTaken: number;
    totalClasses: number;
    currentStreak: number;
    longestStreak: number;
  }>;
  overallStreak: number;
  totalXp: number;
}

interface ParentDashboardProps {
  user: {
    id: string;
    name?: string | null;
    persona: string;
  };
  students: StudentData[];
}

export function ParentDashboard({ user, students }: ParentDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Track your children&apos;s learning progress and achievements
        </p>
      </section>

      {/* Students Grid */}
      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No students linked to your account yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="card-persona">
              <CardHeader>
                <CardTitle className="text-xl">
                  {student.name || "Student"}
                </CardTitle>
                <CardDescription>Overall Progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total XP */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Total XP</span>
                    </div>
                    <p className="text-2xl font-bold">{student.totalXp.toLocaleString()}</p>
                  </div>

                  {/* Current Streak */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">
                      {student.overallStreak}
                    </p>
                  </div>
                </div>

                {/* Subject Progress */}
                {student.subjects.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Subject Progress
                    </h3>
                    <div className="space-y-3">
                      {student.subjects.map((subject) => {
                        const classProgress =
                          subject.totalClasses > 0
                            ? (subject.classesTaken / subject.totalClasses) * 100
                            : 0;
                        // const streakProgress =
                        //   subject.longestStreak > 0
                        //     ? (subject.currentStreak / subject.longestStreak) * 100
                        //     : 0;

                        return (
                          <div
                            key={subject.name}
                            className="space-y-2 p-3 border rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{subject.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {subject.totalXp} XP
                              </Badge>
                            </div>

                            {/* Classes Progress */}
                            {subject.totalClasses > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Classes
                                  </span>
                                  <span>
                                    {subject.classesTaken} / {subject.totalClasses}
                                  </span>
                                </div>
                                <Progress value={classProgress} className="h-2" />
                              </div>
                            )}

                            {/* Streak Indicator */}
                            {subject.currentStreak > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                  <Flame className="h-3 w-3" />
                                  {subject.currentStreak} day streak
                                </span>
                                {subject.longestStreak > subject.currentStreak && (
                                  <span className="text-muted-foreground">
                                    Best: {subject.longestStreak}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No subjects enrolled yet
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

