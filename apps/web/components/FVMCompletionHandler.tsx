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
          // If unauthorized, user needs to log in first
          if (response.status === 401) {
            // Store completion data in sessionStorage to complete after login
            const completionData = {
              deckId,
              deckSubject: deckSubject || undefined,
              score,
              completionTimeMs,
              correctAnswers,
              totalQuestions,
            };
            sessionStorage.setItem("fvm_completion", JSON.stringify(completionData));
            
            // Redirect to login with current page as next param
            const currentPath = window.location.pathname;
            router.push(`/login?next=${encodeURIComponent(currentPath)}&from_smart_link=1`);
            return;
          }

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

