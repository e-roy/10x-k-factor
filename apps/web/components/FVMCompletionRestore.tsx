"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client component that restores FVM completion after login
 * Checks sessionStorage for completion data and completes the result creation
 */
export function FVMCompletionRestore() {
  const router = useRouter();

  useEffect(() => {
    const restoreCompletion = async () => {
      // Check if there's completion data in sessionStorage
      const completionDataStr = sessionStorage.getItem("fvm_completion");
      if (!completionDataStr) {
        return;
      }

      try {
        const completionData = JSON.parse(completionDataStr);
        
        // Try to create the result
        const response = await fetch("/api/results", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: completionData.deckSubject,
            score: completionData.score,
            metadata: {
              deckId: completionData.deckId,
              completionTimeMs: completionData.completionTimeMs,
              correctAnswers: completionData.correctAnswers,
              totalQuestions: completionData.totalQuestions,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Clear the stored completion data
          sessionStorage.removeItem("fvm_completion");
          
          if (data.success && data.result?.id) {
            // Redirect to results page with share=true
            router.push(`/results/${data.result.id}?share=true`);
          } else {
            router.push("/app");
          }
        } else if (response.status === 401) {
          // Still not authenticated, clear the data and let user log in
          sessionStorage.removeItem("fvm_completion");
        } else {
          // Other error, clear data and redirect to app
          sessionStorage.removeItem("fvm_completion");
          console.error("[FVMCompletionRestore] Failed to create result");
        }
      } catch (error) {
        console.error("[FVMCompletionRestore] Error restoring completion:", error);
        sessionStorage.removeItem("fvm_completion");
      }
    };

    restoreCompletion();
  }, [router]);

  return null;
}

