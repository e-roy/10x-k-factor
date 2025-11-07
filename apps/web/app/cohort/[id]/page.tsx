import { notFound } from "next/navigation";
import { db } from "@/db/index";
import { cohorts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PresenceWidget } from "@/components/PresenceWidget";
import { ShareButton } from "@/components/ShareButton";
import { CohortFeed } from "@/components/CohortFeed";
import { InviteJoinedTracker } from "@/components/InviteJoinedTracker";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

interface CohortPageProps {
  params: Promise<{ id: string }>;
}

async function getCohort(id: string) {
  const [cohort] = await db
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
    .where(eq(cohorts.id, id))
    .limit(1);

  return cohort;
}

export default async function CohortPage({ params }: CohortPageProps) {
  const { id } = await params;
  const cohort = await getCohort(id);
  const session = await auth();

  if (!cohort) {
    notFound();
  }

  const isCreator = session?.user?.id === cohort.createdBy;

  return (
    <>
      <InviteJoinedTracker />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/app" },
            { label: "Cohorts", href: "/app/cohorts" },
            { label: cohort.name, href: `/cohort/${cohort.id}` },
          ]}
        />
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{cohort.name}</h1>
            {cohort.subject && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-2">
                  Subject: <span className="font-medium">{cohort.subject}</span>
                </p>
                <PresenceWidget subject={cohort.subject} />
              </div>
            )}
            {cohort.creatorName && (
              <p className="text-sm text-muted-foreground mt-2">
                Created by {cohort.creatorName}
                {cohort.createdAt && (
                  <span className="ml-2">
                    • {new Date(cohort.createdAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            )}
          </div>
          {/* Invite CTA */}
          {isCreator && cohort.subject && (
            <div className="ml-4">
              <ShareButton
                resultId={cohort.id}
                userId={cohort.createdBy}
                persona="tutor"
                subject={cohort.subject}
                loop="results_rally"
              />
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <CohortFeed
              cohortId={cohort.id}
              subject={cohort.subject}
              createdBy={cohort.createdBy}
            />
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

