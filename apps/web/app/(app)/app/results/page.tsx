import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { results } from "@/db/schema/index";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Results",
};

// Auth protection is handled by (app)/layout.tsx
// We still need to get session here for displaying user info
export default async function ResultsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  // Fetch user's results
  const userResults = await db
    .select()
    .from(results)
    .where(eq(results.userId, session.user.id))
    .orderBy(desc(results.createdAt))
    .limit(50);

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || session?.user?.email}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.role === "admin" && (
              <Button asChild>
                <Link href="/app/admin/results/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Result
                </Link>
              </Button>
            )}        
          </div>
        </div>

        {userResults.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any results yet.
                </p>
                {session?.user?.role === "admin" && (
                  <Button asChild>
                    <Link href="/app/admin/results/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Result
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {result.subject || "Practice"}
                      {result.score !== null && (
                        <span className="ml-2 text-lg font-bold">
                          {result.score}%
                        </span>
                      )}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/results/${result.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.subject && (
                      <p className="text-sm text-muted-foreground">
                        Subject: {result.subject}
                      </p>
                    )}
                    {result.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.createdAt).toLocaleDateString()}
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
