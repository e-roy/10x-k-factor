"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, User, Clock, Brain } from "lucide-react";

interface ChallengeGateProps {
  challenge: {
    id: string;
    subject: string;
    difficulty: string;
    questionCount: number;
    creatorId: string;
  };
  smartLinkCode?: string;
}

/**
 * Gate component shown to unauthenticated users visiting a challenge link
 * Prompts them to sign in or continue as guest
 */
export function ChallengeGate({ challenge, smartLinkCode }: ChallengeGateProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleSignIn = () => {
    const returnUrl = `/challenge/${challenge.id}${smartLinkCode ? `?sl=${smartLinkCode}` : ""}`;
    router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
  };

  const handleGuestStart = () => {
    setIsStarting(true);
    // Store attribution in localStorage for guest flow
    if (smartLinkCode) {
      localStorage.setItem("challenge_attribution", JSON.stringify({
        challengeId: challenge.id,
        smartLinkCode,
        creatorId: challenge.creatorId,
        timestamp: Date.now(),
      }));
    }
    // Redirect to guest challenge page
    router.push(`/challenge/${challenge.id}/guest${smartLinkCode ? `?sl=${smartLinkCode}` : ""}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
      <Card className="max-w-lg w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">
              You&apos;ve Been Challenged!
            </CardTitle>
            <CardDescription className="text-base">
              A friend wants to see if you can beat their score
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Challenge Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-semibold">{challenge.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="font-semibold">{challenge.questionCount}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-1">
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)} Level
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSignIn}
              className="w-full text-lg py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              Sign In to Take Challenge
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              onClick={handleGuestStart}
              disabled={isStarting}
              variant="outline"
              className="w-full text-lg py-6"
              size="lg"
            >
              {isStarting ? (
                "Starting..."
              ) : (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  Continue as Guest
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Guest users can complete the challenge but won&apos;t earn XP or rewards.
              Create an account after to save your progress!
            </p>
          </div>

          {/* Benefits */}
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-semibold">Why sign in?</p>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Earn XP and rewards for completing challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Track your progress and compete on leaderboards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Challenge friends back and see who&apos;s better</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Get personalized learning recommendations</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

