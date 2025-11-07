"use client";

import { useState, useEffect } from "react";
import { TallModal } from "./TallModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Target, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Challenge {
  id: string;
  subject: string;
  questions: Question[];
  difficulty: string;
  status: string;
  expiresAt: string;
}

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId?: string;
  onComplete?: (challengeId: string, score: number) => void;
}

export function ChallengeModal({
  isOpen,
  onClose,
  challengeId,
  onComplete,
}: ChallengeModalProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenge = async () => {
    if (!challengeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/challenges/${challengeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch challenge");
      }

      const data = await response.json();
      setChallenge(data);
    } catch (err) {
      console.error("Error fetching challenge:", err);
      setError(err instanceof Error ? err.message : "Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  // Fetch challenge data when modal opens
  useEffect(() => {
    if (isOpen && challengeId) {
      fetchChallenge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, challengeId]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    setSubmitting(true);

    try {
      // Calculate score
      let correct = 0;
      challenge.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          correct++;
        }
      });

      const score = Math.round((correct / challenge.questions.length) * 100);

      // Update challenge status
      const response = await fetch(`/api/challenges/${challenge.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          score,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit challenge");
      }

      setShowResults(true);
      onComplete?.(challenge.id, score);
    } catch (err) {
      console.error("Error submitting challenge:", err);
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!challenge) return 0;
    let correct = 0;
    challenge.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / challenge.questions.length) * 100);
  };

  const currentQuestion = challenge?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (challenge?.questions.length ?? 0) - 1;
  const allAnswered = challenge?.questions.every((_, idx) => answers[idx] !== undefined);

  if (loading) {
    return (
      <TallModal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Challenge..."
        icon={<Target className="h-6 w-6 text-persona-primary" />}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-persona-primary" />
        </div>
      </TallModal>
    );
  }

  if (error || !challenge) {
    return (
      <TallModal
        isOpen={isOpen}
        onClose={onClose}
        title="Error"
        icon={<AlertCircle className="h-6 w-6 text-red-500" />}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">{error || "Challenge not found"}</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </TallModal>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const correct = challenge.questions.filter((q, idx) => answers[idx] === q.correctAnswer).length;

    return (
      <TallModal
        isOpen={isOpen}
        onClose={onClose}
        title="Challenge Complete! 🎉"
        icon={<CheckCircle className="h-6 w-6 text-green-500" />}
      >
        <div className="space-y-6">
          {/* Score Display */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                {score}%
              </div>
              <p className="text-muted-foreground">
                You got {correct} out of {challenge.questions.length} questions correct
              </p>
            </CardContent>
          </Card>

          {/* Question Review */}
          <div className="space-y-3">
            <h3 className="font-semibold">Review</h3>
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

          <Button onClick={onClose} className="w-full btn-persona">
            Done
          </Button>
        </div>
      </TallModal>
    );
  }

  return (
    <TallModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${challenge.subject} Challenge`}
      icon={<Target className="h-6 w-6 text-persona-primary" />}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {challenge.questions.length}
          </div>
          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Previous
              </Button>
            )}
            {!isLastQuestion ? (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={answers[currentQuestionIndex] === undefined}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="btn-persona"
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
        </div>
      }
    >
      <div className="space-y-6">
        {/* Challenge Info */}
        <Card className="card-persona">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-semibold">{challenge.subject}</p>
            </div>
            <Badge variant="secondary" className="bg-persona-overlay">
              {challenge.difficulty}
            </Badge>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {Object.keys(answers).length} / {challenge.questions.length} answered
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-persona-primary transition-all duration-300"
              style={{
                width: `${(Object.keys(answers).length / challenge.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
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
                        ? "border-persona-primary bg-persona-overlay"
                        : "border-border hover:border-persona-primary/50"
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
        )}

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2">
          {challenge.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentQuestionIndex
                  ? "w-6 bg-persona-primary"
                  : answers[idx] !== undefined
                    ? "bg-persona-primary/60"
                    : "bg-muted"
              )}
              title={`Question ${idx + 1}${answers[idx] !== undefined ? " (answered)" : ""}`}
            />
          ))}
        </div>
      </div>
    </TallModal>
  );
}
