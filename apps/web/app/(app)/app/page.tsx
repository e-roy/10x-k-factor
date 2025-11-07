import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { results, cohorts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PresenceWidget } from "@/components/PresenceWidget";
import { InviteButton } from "@/components/InviteButton";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { calculateStreak } from "@/lib/streaks";
import { BarChart3, Users, Share2, Flame } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  const userId = session.user.id;

  // Fetch user data including onboarding status
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Fetch user's recent results
  const recentResults = await db
    .select()
    .from(results)
    .where(eq(results.userId, userId))
    .orderBy(desc(results.createdAt))
    .limit(10);

  const lastResult = recentResults[0] || null;

  // Fetch user's cohorts (cohorts created by user or they're a member)
  // For now, just get cohorts created by user
  const userCohorts = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.createdBy, userId))
    .orderBy(desc(cohorts.createdAt))
    .limit(5);

  // Calculate streak
  const streak = await calculateStreak(userId);

  // Get recommended deck (simple logic: use first subject from results or cohorts, or default to algebra)
  let recommendedDeckId = "deck-1"; // default
  if (lastResult?.subject) {
    recommendedDeckId = "deck-1"; // Can enhance later with subject-based deck selection
  } else if (userCohorts.length > 0 && userCohorts[0].subject) {
    recommendedDeckId = "deck-1";
  }

  // Get friends online count (simplified: count users in same cohorts)
  // For now, just show presence count for most common subject
  const mostCommonSubject = lastResult?.subject || userCohorts[0]?.subject || "algebra";

  return (
    <>
      <OnboardingWrapper
        userId={userId}
        currentPersona={session.user.persona || "student"}
        onboardingCompleted={user?.onboardingCompleted ?? false}
      />
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Presence Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Now
            </CardTitle>
            <CardDescription>People practicing right now</CardDescription>
          </CardHeader>
          <CardContent>
            <PresenceWidget subject={mostCommonSubject} />
            <p className="text-sm text-muted-foreground mt-2">
              {userCohorts.length > 0
                ? `${userCohorts.length} cohort${userCohorts.length !== 1 ? "s" : ""}`
                : "No cohorts yet"}
            </p>
          </CardContent>
        </Card>

        {/* Last Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Latest Result
            </CardTitle>
            <CardDescription>Your most recent practice session</CardDescription>
          </CardHeader>
          <CardContent>
            {lastResult ? (
              <div>
                <p className="text-sm font-medium">
                  Score: {lastResult.score !== null ? `${lastResult.score}%` : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lastResult.subject || "Practice"} •{" "}
                  {lastResult.createdAt
                    ? new Date(lastResult.createdAt).toLocaleDateString()
                    : "Recently"}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={`/results/${lastResult.id}`}>View Details</Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  No results yet. Start practicing!
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/fvm/skill/deck-1">Start Practice</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invite CTA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Invite Friends
            </CardTitle>
            <CardDescription>Share and grow together</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Invite friends to practice together and earn rewards.
            </p>
            <InviteButton
              userId={session.user.id}
              persona={session.user.persona || "student"}
              variant="default"
              size="sm"
              className="w-full"
            >
              Create Invite Link
            </InviteButton>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Streak Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
            <CardDescription>Consecutive days practicing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {streak === 0
                ? "Start your streak today!"
                : streak === 1
                  ? "1 day streak"
                  : `${streak} day streak`}
            </p>
          </CardContent>
        </Card>

        {/* Cohorts Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cohorts</CardTitle>
            <CardDescription>Groups you&apos;re part of</CardDescription>
          </CardHeader>
          <CardContent>
            {userCohorts.length > 0 ? (
              <div className="space-y-2">
                {userCohorts.slice(0, 3).map((cohort) => (
                  <div key={cohort.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{cohort.name}</p>
                      {cohort.subject && (
                        <p className="text-xs text-muted-foreground">
                          {cohort.subject}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/cohort/${cohort.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
                {userCohorts.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{userCohorts.length - 3} more
                  </p>
                )}
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <Link href="/app/cohorts">View All</Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  You&apos;re not in any cohorts yet.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/app/cohorts/new">Create Cohort</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recommended Deck Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Recommended</CardTitle>
            <CardDescription>Continue your learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium">Algebra Practice</p>
              <p className="text-xs text-muted-foreground mt-1">
                5 questions • ~5 min
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href={`/fvm/skill/${recommendedDeckId}`}>Start Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

