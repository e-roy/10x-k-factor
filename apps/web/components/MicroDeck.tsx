"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Deck } from "@/lib/decks";
import { RewardPreview } from "@/components/RewardPreview";
import { track } from "@/lib/track";
import { useToast } from "@/components/ui/use-toast";

interface MicroDeckProps {
  deck: Deck;
  attribution?: {
    inviter_id: string;
    loop: string;
    smart_link_code: string;
  };
  onComplete?: (
    completionTimeMs: number,
    correctAnswers: number,
    totalQuestions: number
  ) => void;
}

export function MicroDeck({ deck, attribution, onComplete }: MicroDeckProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [focusedOption, setFocusedOption] = useState<number | null>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = deck.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / deck.questions.length) * 100;
  const allAnswered =
    Object.keys(selectedAnswers).length === deck.questions.length;

  // Timer effect
  useEffect(() => {
    if (!isCompleted) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isCompleted, startTime]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (optionIndex: number) => {
      if (isCompleted) return;

      const newAnswers = {
        ...selectedAnswers,
        [currentQuestionIndex]: optionIndex,
      };
      setSelectedAnswers(newAnswers);

      // Auto-advance to next question if not the last
      if (currentQuestionIndex < deck.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setFocusedOption(null);
        }, 300);
      }
    },
    [currentQuestionIndex, selectedAnswers, deck.questions.length, isCompleted]
  );

  // Handle completion
  const handleComplete = useCallback(async () => {
    if (isCompleted || !allAnswered) return;

    setIsCompleted(true);
    const completionTime = Date.now() - startTime;

    // Calculate correct answers
    let correctCount = 0;
    deck.questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer !== undefined && selectedAnswer === question.correct) {
        correctCount++;
      }
    });

    // Fire invite.fvm event
    if (attribution) {
      await track("invite.fvm", {
        smart_link_code: attribution.smart_link_code,
        loop: attribution.loop,
        inviter_id: attribution.inviter_id,
        deck_id: deck.id,
        completion_time_ms: completionTime,
      });

      // Grant reward to inviter (non-blocking)
      try {
        const dedupeKey = `${attribution.inviter_id}-${attribution.smart_link_code}-fvm`;
        const response = await fetch("/api/rewards/grant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: attribution.inviter_id,
            rewardType: "ai_minutes",
            amount: 15,
            loop: attribution.loop,
            dedupeKey,
            metadata: {
              smart_link_code: attribution.smart_link_code,
              deck_id: deck.id,
              completion_time_ms: completionTime,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            toast({
              title: "Reward Granted!",
              description: `Your friend earned +15 AI minutes for completing the challenge!`,
              variant: "success",
            });
          }
        } else {
          const errorData = await response.json();
          if (errorData.error === "Reward denied") {
            // Don't show toast for denied rewards (safety check failed)
            console.warn("[MicroDeck] Reward denied:", errorData.reason);
          } else {
            console.error("[MicroDeck] Failed to grant reward:", errorData);
          }
        }
      } catch (error) {
        // Non-blocking - log but don't break the flow
        console.error("[MicroDeck] Error granting reward:", error);
      }
    } else {
      console.warn("[MicroDeck] No attribution data available for event");
    }

    // Call parent completion handler if provided
    if (onComplete) {
      onComplete(completionTime, correctCount, deck.questions.length);
    }
  }, [
    isCompleted,
    allAnswered,
    startTime,
    attribution,
    deck.id,
    deck.questions,
    selectedAnswers,
    onComplete,
    toast,
  ]);

  // Keyboard navigation
  useEffect(() => {
    if (isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const current =
          focusedOption ?? selectedAnswers[currentQuestionIndex] ?? 0;
        const newIndex =
          current > 0 ? current - 1 : currentQuestion.options.length - 1;
        setFocusedOption(newIndex);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const current =
          focusedOption ?? selectedAnswers[currentQuestionIndex] ?? -1;
        const newIndex =
          current < currentQuestion.options.length - 1 ? current + 1 : 0;
        setFocusedOption(newIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedOption !== null) {
          handleSelectAnswer(focusedOption);
        } else if (selectedAnswers[currentQuestionIndex] !== undefined) {
          // If already answered, move to next or complete
          if (currentQuestionIndex < deck.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setFocusedOption(null);
          } else if (allAnswered) {
            handleComplete();
          }
        }
      } else if (e.key === "Tab") {
        // Allow default tab behavior
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestionIndex,
    focusedOption,
    selectedAnswers,
    currentQuestion,
    handleSelectAnswer,
    handleComplete,
    allAnswered,
    deck.questions.length,
    isCompleted,
  ]);

  // Focus question container on mount/change
  useEffect(() => {
    if (questionRef.current && !isCompleted) {
      questionRef.current.focus();
    }
  }, [currentQuestionIndex, isCompleted]);

  if (isCompleted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg text-muted-foreground">
                You completed the deck in {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                Great job! Your answers have been recorded.
              </p>
            </div>
            <RewardPreview loop={attribution?.loop} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress and timer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Question {currentQuestionIndex + 1} of {deck.questions.length}
            </CardTitle>
            <div className="text-sm font-mono text-muted-foreground">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Question card */}
      <Card
        ref={questionRef}
        tabIndex={0}
        className="focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            const isFocused = focusedOption === index;
            const isAnswered =
              selectedAnswers[currentQuestionIndex] !== undefined;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectAnswer(index)}
                disabled={isCompleted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 font-semibold"
                    : isFocused
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                } ${isAnswered && !isSelected ? "opacity-60" : ""}`}
                onFocus={() => setFocusedOption(index)}
                onBlur={() => {
                  // Delay blur to allow click to register
                  setTimeout(() => setFocusedOption(null), 200);
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit button */}
      {allAnswered && (
        <div className="flex justify-center">
          <Button onClick={handleComplete} size="lg" className="min-w-[200px]">
            Complete Deck
          </Button>
        </div>
      )}
    </div>
  );
}
