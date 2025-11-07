"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
// No import needed - we're just using the callback signature

interface FVMCompletionHandlerProps {
  deckId: string;
  deckSubject?: string | null;
  children: (onComplete: (completionTimeMs: number, correctAnswers: number, totalQuestions: number) => void) => React.ReactNode;
}

/**
 * Client component that handles FVM completion:
 * - Calculates score
 * - Creates result via API
 * - Redirects to results page with share=true param
 */
export function FVMCompletionHandler({
  deckId,
  deckSubject,
  children,
}: FVMCompletionHandlerProps) {
  const router = useRouter();

  const handleComplete = useCallback(
    async (completionTimeMs: number, correctAnswers: number, totalQuestions: number) => {
      try {
        // Calculate score percentage
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Create result via API
        const response = await fetch("/api/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: deckSubject || undefined,
            score,
            metadata: {
              deckId,
              completionTimeMs,
              correctAnswers,
              totalQuestions,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[FVMCompletionHandler] Failed to create result:", errorData);
          // Still redirect to dashboard even if result creation fails
          router.push("/app");
          return;
        }

        const data = await response.json();
        if (data.success && data.result?.id) {
          // Redirect to results page with share=true to auto-open share modal
          router.push(`/results/${data.result.id}?share=true`);
        } else {
          // Fallback redirect
          router.push("/app");
        }
      } catch (error) {
        console.error("[FVMCompletionHandler] Error creating result:", error);
        // Fallback redirect on error
        router.push("/app");
      }
    },
    [deckId, deckSubject, router]
  );

  return <>{children(handleComplete)}</>;
}

