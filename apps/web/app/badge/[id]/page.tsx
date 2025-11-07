import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButton } from "@/components/ShareButton";
import { chooseLoop, compose } from "@10x-k-factor/agents";
import { getCooldowns } from "@/lib/agents/cooldowns";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface BadgePageProps {
  params: Promise<{ id: string }>;
}

export default async function BadgePage({ params }: BadgePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user persona
  const [user] = await db
    .select({
      persona: users.persona,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    notFound();
  }

  const persona = (user.persona || "student") as "student" | "parent" | "tutor";

  // Get cooldowns
  const cooldowns = await getCooldowns(session.user.id);

  // Call orchestrator to choose loop (badge_earned triggers results_rally)
  let loopData = null;
  let personalizeData = null;

  try {
    const orchestratorResult = chooseLoop({
      event: "badge_earned",
      persona,
      subject: undefined, // Could come from badge metadata
      cooldowns,
    });

    loopData = orchestratorResult;

    // Call personalization to get copy
    const personalizeResult = compose({
      intent: "share_badge",
      persona,
      subject: undefined,
      loop: orchestratorResult.loop,
    });

    personalizeData = personalizeResult;
  } catch (error) {
    console.error("[BadgePage] Error calling agents:", error);
    // Fallback to results_rally
    loopData = {
      loop: "results_rally",
      eligibility_reason: "fallback",
      rationale: "Using default loop for badge",
      features_used: ["fallback"],
      ttl_ms: 0,
    };
  }

  // Generate deckId for FVM
  const deckId = "deck-default"; // In production, this would come from badge metadata

  // Mock badge data (in production, this would come from database)
  const badgeName = `Badge ${id}`;
  const badgeDescription = "You've earned a new badge!";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Badge Earned! 🏆</h1>
          <p className="text-muted-foreground mt-2">{badgeDescription}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{badgeName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl text-center mb-4">🏆</div>
            <p className="text-center text-muted-foreground">
              {badgeDescription}
            </p>
          </CardContent>
        </Card>

        {loopData && personalizeData && (
          <Card>
            <CardHeader>
              <CardTitle>Share Your Achievement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{personalizeData.copy}</p>
              {personalizeData.reward_preview && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Reward:{" "}
                    {personalizeData.reward_preview.description ||
                      `${personalizeData.reward_preview.type}${
                        personalizeData.reward_preview.amount
                          ? ` (${personalizeData.reward_preview.amount})`
                          : ""
                      }`}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <ShareButton
                  userId={session.user.id}
                  persona={persona}
                  loop={loopData.loop}
                  shareCopy={personalizeData.copy}
                  deckId={deckId}
                />
              </div>
              {process.env.NODE_ENV === "development" && (
                <details className="text-xs text-muted-foreground">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {JSON.stringify(
                      {
                        loop: loopData.loop,
                        eligibility_reason: loopData.eligibility_reason,
                        rationale: loopData.rationale,
                        personalize_rationale: personalizeData.rationale,
                      },
                      null,
                      2
                    )}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

