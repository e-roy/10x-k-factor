import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { cohorts, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Cohorts",
};

export default async function CohortsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  // Fetch all cohorts with creator info
  const allCohorts = await db
    .select({
      id: cohorts.id,
      name: cohorts.name,
      subject: cohorts.subject,
      createdBy: cohorts.createdBy,
      createdAt: cohorts.createdAt,
      creatorName: users.name,
      creatorEmail: users.email,
    })
    .from(cohorts)
    .leftJoin(users, eq(cohorts.createdBy, users.id))
    .orderBy(desc(cohorts.createdAt))
    .limit(100);

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cohorts</h1>
            <p className="text-muted-foreground">
              Browse study groups and challenges
            </p>
          </div>
          <Button asChild>
            <Link href="/cohorts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Cohort
            </Link>
          </Button>
        </div>

        {allCohorts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No cohorts yet. Be the first to create one!
                </p>
                <Button asChild>
                  <Link href="/cohorts/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Cohort
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allCohorts.map((cohort) => (
              <Card key={cohort.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {cohort.name}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/cohort/${cohort.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cohort.subject && (
                      <p className="text-sm text-muted-foreground">
                        Subject: <span className="font-medium">{cohort.subject}</span>
                      </p>
                    )}
                    {cohort.creatorName && (
                      <p className="text-sm text-muted-foreground">
                        Created by {cohort.creatorName}
                      </p>
                    )}
                    {cohort.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(cohort.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

