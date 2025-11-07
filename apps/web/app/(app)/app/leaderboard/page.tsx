import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { results, cohorts } from "@/db/schema/index";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboards",
};

// Common subjects to show as defaults
const COMMON_SUBJECTS = [
  { name: "algebra", label: "Algebra" },
  { name: "math", label: "Math" },
  { name: "geometry", label: "Geometry" },
  { name: "calculus", label: "Calculus" },
  { name: "physics", label: "Physics" },
  { name: "chemistry", label: "Chemistry" },
];

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  // Fetch subjects that have results or cohorts
  const resultsSubjects = await db
    .selectDistinct({
      subject: results.subject,
    })
    .from(results)
    .where(sql`${results.subject} IS NOT NULL`)
    .limit(20);

  const cohortsSubjects = await db
    .selectDistinct({
      subject: cohorts.subject,
    })
    .from(cohorts)
    .where(sql`${cohorts.subject} IS NOT NULL`)
    .limit(20);

  // Extract unique subjects and normalize
  const availableSubjects = new Set<string>();
  [...resultsSubjects, ...cohortsSubjects].forEach((row) => {
    if (row.subject) {
      availableSubjects.add(row.subject.toLowerCase().trim());
    }
  });

  // Combine common subjects with available subjects
  const allSubjects = [
    ...COMMON_SUBJECTS,
    ...Array.from(availableSubjects)
      .filter((s) => !COMMON_SUBJECTS.some((cs) => cs.name === s))
      .map((s) => ({
        name: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
      })),
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leaderboards</h1>
          <p className="text-muted-foreground mt-1">
            Compete with others and see who&apos;s on top!
          </p>
        </div>

        {allSubjects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No leaderboards available yet. Start practicing to create leaderboards!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allSubjects.map((subject) => (
              <Card key={subject.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {subject.label}
                  </CardTitle>
                  <CardDescription>
                    View top performers in {subject.label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/app/leaderboard/${encodeURIComponent(subject.name)}`}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Leaderboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

