import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db/index";
import { results, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ShareButton } from "@/components/ShareButton";
import { PresenceWidget } from "@/components/PresenceWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { chooseLoop, compose } from "@10x-k-factor/agents";
import { getCooldowns } from "@/lib/agents/cooldowns";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

async function getResult(id: string) {
  const [result] = await db
    .select({
      id: results.id,
      userId: results.userId,
      subject: results.subject,
      score: results.score,
      metadata: results.metadata,
      createdAt: results.createdAt,
      persona: users.persona,
    })
    .from(results)
    .leftJoin(users, eq(results.userId, users.id))
    .where(eq(results.id, id))
    .limit(1);

  return result;
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return {
      title: "Results Not Found",
    };
  }

  const persona = result.persona || "student";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ogImageUrl = `${baseUrl}/api/og?resultId=${id}&persona=${persona}`;

  const title = result.subject
    ? `${result.subject} Results - ${result.score}%`
    : `Results - ${result.score}%`;

  const description = result.subject
    ? `Check out my ${result.subject} results!`
    : "Check out my results!";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      url: `${baseUrl}/results/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const result = await getResult(id);
  const session = await auth();

  if (!result) {
    notFound();
  }

  // Check if current user is the result owner
  const isOwner = session?.user?.id === result?.userId;

  // Get orchestrator and personalization data (only for owner)
  let loopData = null;
  let personalizeData = null;

  if (isOwner && session?.user?.id) {
    try {
      // Get cooldowns for the user
      const cooldowns = await getCooldowns(session.user.id);

      // Call orchestrator to choose loop
      const orchestratorResult = chooseLoop({
        event: "results_viewed",
        persona: (result.persona || "student") as "student" | "parent" | "tutor",
        subject: result.subject || undefined,
        cooldowns,
      });

      loopData = orchestratorResult;

      // Call personalization to get copy
      const personalizeResult = compose({
        intent: "share_results",
        persona: (result.persona || "student") as "student" | "parent" | "tutor",
        subject: result.subject || undefined,
        loop: orchestratorResult.loop,
      });

      personalizeData = personalizeResult;
    } catch (error) {
      console.error("[ResultsPage] Error calling agents:", error);
      // Continue with fallback - loopData and personalizeData remain null
    }
  }

  // Extract metadata
  const metadata = (result?.metadata || {}) as Record<string, unknown>;
  const skills = (metadata.skills as Record<string, number>) || {};
  const recommendations =
    (metadata.recommendations as string[]) ||
    (result?.subject
      ? [
          `Practice more ${result?.subject} problems`,
          `Review ${result?.subject} concepts`,
          `Try the ${result?.subject} challenge`,
        ]
      : ["Keep practicing!", "Review your notes", "Try more exercises"]);

  // Generate heatmap data from skills or score
  const skillEntries = Object.entries(skills);
  const heatmapData =
    skillEntries.length > 0
      ? skillEntries.map(([name, value]) => ({
          name,
          score: typeof value === "number" ? value : 0,
        }))
      : // Fallback: generate from score
        [
          { name: "Understanding", score: result?.score || 0 },
          { name: "Application", score: (result?.score || 0) - 10 },
          { name: "Analysis", score: (result?.score || 0) - 5 },
          { name: "Problem Solving", score: (result?.score || 0) + 5 },
        ].map((s) => ({ ...s, score: Math.max(0, Math.min(100, s.score)) }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            {result?.subject && (
              <div className="mt-1">
                <p className="text-muted-foreground">{result?.subject}</p>
                <PresenceWidget subject={result?.subject} />
              </div>
            )}
          </div>
          {/* Only show share button if user is the owner */}
          {isOwner && (
            <ShareButton
              resultId={result.id}
              userId={result.userId}
              persona={result.persona || "student"}
              subject={result.subject}
              loop={loopData?.loop || "results_rally"}
              shareCopy={personalizeData?.copy}
            />
          )}
        </div>

        {/* Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold">{result?.score ?? 0}%</div>
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${getScoreColor(
                      result?.score || 0
                    )}`}
                    style={{ width: `${result?.score || 0}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {result?.score && result?.score >= 80
                    ? "Excellent work!"
                    : result?.score && result?.score >= 60
                      ? "Good progress!"
                      : "Keep practicing!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heatmapData.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground">
                      {skill.score}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getScoreColor(
                        skill.score
                      )}`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Personalized Viral Loop CTA (only for owner) */}
        {isOwner && loopData && personalizeData && (
          <Card>
            <CardHeader>
              <CardTitle>Share Your Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">{personalizeData.copy}</p>
              {personalizeData.reward_preview && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Reward: {personalizeData.reward_preview.description ||
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
                  resultId={result.id}
                  userId={result.userId}
                  persona={result.persona || "student"}
                  subject={result.subject}
                  loop={loopData.loop}
                  shareCopy={personalizeData.copy}
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
