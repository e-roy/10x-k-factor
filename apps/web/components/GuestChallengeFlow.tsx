"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle, XCircle, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Challenge {
  id: string;
  subject: string;
  difficulty: string;
  questions: Question[];
  expiresAt: string | null;
  creatorId: string;
}

interface GuestChallengeFlowProps {
  challengeId: string;
  guestSessionId: string;
  smartLinkCode?: string;
}

/**
 * Guest challenge completion flow
 * Allows unauthenticated users to complete challenges
 * Stores results temporarily for conversion on signup
 */
export function GuestChallengeFlow({
  challengeId,
  guestSessionId,
  smartLinkCode,
}: GuestChallengeFlowProps) {
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Fetch challenge data
  useEffect(() => {
    async function fetchChallenge() {
      try {
        setLoading(true);
        const response = await fetch(`/api/challenges/${challengeId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Challenge not found");
          } else if (response.status === 403) {
            setError("You don't have access to this challenge");
          } else {
            setError("Failed to load challenge");
          }
          return;
        }

        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        console.error("[GuestChallengeFlow] Error fetching challenge:", err);
        setError("Failed to load challenge");
      } finally {
        setLoading(false);
      }
    }

    fetchChallenge();
  }, [challengeId]);

  const handleAnswerSelect = useCallback((questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!challenge) return;

    setSubmitting(true);
    setError(null);

    try {
      // Get attribution data from localStorage
      const attribution = localStorage.getItem("challenge_attribution");
      const attributionData = attribution ? JSON.parse(attribution) : {};

      // Submit guest completion
      const response = await fetch("/api/challenges/guest/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          guestSessionId,
          answers,
          smartLinkCode: smartLinkCode || attributionData.smartLinkCode,
          inviterId: attributionData.creatorId || challenge.creatorId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit challenge");
      }

      const data = await response.json();
      setScore(data.score);
      setCorrectCount(data.correctCount);
      setShowResults(true);
    } catch (err) {
      console.error("[GuestChallengeFlow] Error submitting:", err);
      setError("Failed to submit challenge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [challenge, guestSessionId, answers, smartLinkCode]);

  const handleSignUp = useCallback(() => {
    // Store additional context for registration
    localStorage.setItem("guest_completion_context", JSON.stringify({
      challengeId,
      score,
      fromChallenge: true,
    }));
    
    router.push(`/register?from=challenge&next=${encodeURIComponent(`/challenge/${challengeId}`)}`);
  }, [challengeId, score, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">{error || "Challenge not found"}</p>
            <Button onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <span className="text-5xl font-bold text-white">{score}%</span>
              </div>
              <h2 className="text-3xl font-bold">Challenge Complete!</h2>
              <p className="text-muted-foreground">
                You got {correctCount} out of {challenge.questions.length} questions correct
              </p>
            </div>

            {/* Signup CTA */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎉</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      Create an account to save your progress!
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Earn <strong className="text-foreground">{Math.floor(score / 10)} XP</strong> for this completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Get a <strong className="text-foreground">25 XP signup bonus</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Challenge friends back and compete on leaderboards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Track your progress and unlock rewards</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSignUp}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    Create Account
                  </Button>
                  <Button
                    onClick={() => router.push(`/login?next=${encodeURIComponent(`/challenge/${challengeId}`)}`)}
                    variant="outline"
                    size="lg"
                  >
                    Sign In
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Your score will be saved when you create an account
                </p>
              </CardContent>
            </Card>

            {/* View Details */}
            <details className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted">
                  <span className="font-semibold">Review Answers</span>
                  <Badge variant="secondary">
                    {correctCount}/{challenge.questions.length}
                  </Badge>
                </div>
              </summary>
              <div className="space-y-3 mt-3">
                {challenge.questions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correctAnswer;
                  return (
                    <Card key={idx} className={cn(
                      "border-2",
                      isCorrect ? "border-green-200 bg-green-50/50 dark:bg-green-950/10" : "border-red-200 bg-red-50/50 dark:bg-red-950/10"
                    )}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{q.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your answer: {q.options[answers[idx]]}
                            </p>
                            {!isCorrect && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            )}
                            {q.explanation && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = challenge.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === challenge.questions.length - 1;
  const allAnswered = challenge.questions.every((_, idx) => answers[idx] !== undefined);
  const progress = (Object.keys(answers).length / challenge.questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{challenge.subject}</h2>
                <Badge variant="secondary">{challenge.difficulty}</Badge>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Guest Mode
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {challenge.questions.length}</span>
              <span>{Object.keys(answers).length} answered</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">{currentQuestion.question}</h3>

              <RadioGroup
                value={answers[currentQuestionIndex]?.toString()}
                onValueChange={(value) => handleAnswerSelect(currentQuestionIndex, parseInt(value))}
              >
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer",
                      answers[currentQuestionIndex] === idx
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                        : "border-border hover:border-purple-300"
                    )}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {!isLastQuestion ? (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={answers[currentQuestionIndex] === undefined}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Challenge"
                )}
              </Button>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2">
            {challenge.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentQuestionIndex
                    ? "w-6 bg-purple-500"
                    : answers[idx] !== undefined
                      ? "bg-purple-300"
                      : "bg-muted"
                )}
                title={`Question ${idx + 1}${answers[idx] !== undefined ? " (answered)" : ""}`}
              />
            ))}
          </div>

          {error && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

