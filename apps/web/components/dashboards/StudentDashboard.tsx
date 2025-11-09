"use client";

import { RadialProgressWidget } from "@/components/RadialProgressWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flame, Users, Target } from "lucide-react";
import Link from "next/link";
import { TranscriptChallengeDemo } from "./TranscriptChallengeDemo";

interface StudentDashboardProps {
  user: {
    id: string;
    name?: string | null;
    persona: string;
  };
  data: {
    subjects: Array<{
      name: string;
      progress: number;
      level: number;
      xp: number;
      xpToNextLevel: number;
    }>;
    streak: number;
    friendsOnline: number;
    challenges: Array<{
      id: string;
      subject: string;
      from: string;
    }>;
  };
}

export function StudentDashboard({ data }: StudentDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.subjects.map((subject) => (
            <RadialProgressWidget
              key={subject.name}
              subject={subject.name}
              progress={subject.progress}
              level={subject.level}
              xp={subject.xp}
              xpToNextLevel={subject.xpToNextLevel}
              onClick={() => {
                // Navigate to subject practice
                window.location.href = `/fvm/skill/deck-1?subject=${subject.name}`;
              }}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Streak Card */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {data.streak} Day Streak
              </CardTitle>
              <CardDescription>
                {data.streak === 0
                  ? "Start your streak today!"
                  : "Keep it going!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/fvm/skill/deck-1">Practice Now</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Study Buddies */}
          <Card className="card-persona">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-persona-primary">
                <Users className="h-5 w-5" />
                {data.friendsOnline} Friends Online
              </CardTitle>
              <CardDescription>Join a study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/app/cohorts">View Cohorts</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Challenges */}
          <Card className="card-persona">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-persona-secondary">
                <Target className="h-5 w-5" />
                {data.challenges.length} Challenges
              </CardTitle>
              <CardDescription>Waiting for you</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/app/results">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Transcript Challenge Demo */}
      <section>
        <Card className="card-persona">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="transcript-challenge" className="border-0">
              <AccordionTrigger className="px-6 py-4">
                <h2 className="text-xl font-semibold">Simulate VarsityTutors Transcript</h2>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <TranscriptChallengeDemo />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </section>
    </div>
  );
}

