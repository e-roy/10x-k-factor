import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { LeaderboardWidget } from "@/components/LeaderboardWidget";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

interface LeaderboardSubjectPageProps {
  params: Promise<{ subject: string }>;
}

/**
 * Validate subject parameter
 */
function validateSubject(subject: string): string | null {
  if (!subject || subject.length === 0 || subject.length > 64) {
    return null;
  }
  // Allow alphanumeric, hyphens, spaces
  if (!/^[a-zA-Z0-9\-\s]+$/.test(subject)) {
    return null;
  }
  return subject.trim();
}

export async function generateMetadata({
  params,
}: LeaderboardSubjectPageProps): Promise<Metadata> {
  const { subject } = await params;
  const validatedSubject = validateSubject(subject);

  if (!validatedSubject) {
    return {
      title: "Leaderboard Not Found",
    };
  }

  const subjectLabel =
    validatedSubject.charAt(0).toUpperCase() + validatedSubject.slice(1);

  return {
    title: `${subjectLabel} Leaderboard`,
  };
}

export default async function LeaderboardSubjectPage({
  params,
}: LeaderboardSubjectPageProps) {
  const { subject: subjectParam } = await params;
  const subject = validateSubject(subjectParam);
  const session = await auth();

  if (!subject) {
    notFound();
  }

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  const subjectLabel =
    subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/app" },
            { label: "Leaderboards", href: "/app/leaderboard" },
            { label: subjectLabel, href: `/app/leaderboard/${subject}` },
          ]}
        />
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/leaderboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leaderboards
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            {subjectLabel} Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Top performers in {subjectLabel.toLowerCase()}
          </p>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Rankings based on activity and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardWidget
              subject={subject}
              limit={20}
              showCurrentUser={true}
              currentUserId={session.user.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

