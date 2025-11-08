import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { challenges } from "@/db/schema/index";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { ChallengeGate } from "@/components/ChallengeGate";

interface ChallengePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sl?: string }>;
}

async function getChallenge(id: string) {
  const [challenge] = await db
    .select({
      id: challenges.id,
      userId: challenges.userId,
      subject: challenges.subject,
      difficulty: challenges.difficulty,
      questions: challenges.questions,
      status: challenges.status,
      expiresAt: challenges.expiresAt,
    })
    .from(challenges)
    .where(eq(challenges.id, id))
    .limit(1);

  return challenge;
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) {
    return {
      title: "Challenge Not Found",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const ogImageUrl = `${baseUrl}/api/og?type=challenge&challengeId=${id}&subject=${encodeURIComponent(challenge.subject || "Challenge")}`;

  const title = `${challenge.subject || "Challenge"} - Can you beat this score?`;
  const description = `Take the ${challenge.subject || ""} challenge and see how you compare!`;

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
      url: `${baseUrl}/challenge/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ChallengePage({
  params,
  searchParams,
}: ChallengePageProps) {
  const { id } = await params;
  const { sl: smartLinkCode } = await searchParams;
  const challenge = await getChallenge(id);
  const session = await auth();

  if (!challenge) {
    notFound();
  }

  // Check if challenge is expired
  if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl">⏰</div>
          <h1 className="text-2xl font-bold">Challenge Expired</h1>
          <p className="text-muted-foreground">
            This challenge has expired. Ask your friend to send you a new one!
          </p>
        </div>
      </div>
    );
  }

  // If user is already signed in and is NOT the challenge creator, redirect to app with modal open
  if (session?.user?.id && session.user.id !== challenge.userId) {
    // User is signed in and not the creator - they can take the challenge
    redirect(`/app?openChallenge=${id}${smartLinkCode ? `&sl=${smartLinkCode}` : ""}`);
  }

  // If user is the challenge creator, redirect to their dashboard
  if (session?.user?.id && session.user.id === challenge.userId) {
    redirect("/app");
  }

  // Show challenge gate for guests and unauthenticated users
  return (
    <ChallengeGate
      challenge={{
        id: challenge.id,
        subject: challenge.subject || "Challenge",
        difficulty: challenge.difficulty,
        questionCount: challenge.questions.length,
        creatorId: challenge.userId,
      }}
      smartLinkCode={smartLinkCode}
    />
  );
}

