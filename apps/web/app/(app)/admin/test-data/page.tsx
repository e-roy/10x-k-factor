"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TestDataPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdItems, setCreatedItems] = useState<{
    result?: { id: string; url: string };
    cohort?: { id: string; url: string };
  }>({});

  const createTestResult = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    const subjects = ["algebra", "geometry", "calculus", "physics", "chemistry"];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const score = Math.floor(Math.random() * 40) + 60; // 60-100

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          score,
          metadata: {
            questions: Math.floor(Math.random() * 15) + 10,
            correct: Math.floor((score / 100) * 20),
            skills: {
              understanding: score + Math.floor(Math.random() * 10) - 5,
              application: score + Math.floor(Math.random() * 10) - 5,
            },
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create result");
      }

      const data = await response.json();
      setCreatedItems((prev) => ({
        ...prev,
        result: { id: data.result.id, url: `/results/${data.result.id}` },
      }));
      setSuccess(`Created test result: ${subject} (${score}%)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create result");
    } finally {
      setIsCreating(false);
    }
  };

  const createTestCohort = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    const subjects = ["algebra", "geometry", "calculus", "physics", "chemistry"];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const names = [
      `${subject.charAt(0).toUpperCase() + subject.slice(1)} Study Group`,
      `${subject.charAt(0).toUpperCase() + subject.slice(1)} Challenge`,
      `${subject.charAt(0).toUpperCase() + subject.slice(1)} Mastery`,
    ];
    const name = names[Math.floor(Math.random() * names.length)];

    try {
      const response = await fetch("/api/cohorts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          subject,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create cohort");
      }

      const data = await response.json();
      setCreatedItems((prev) => ({
        ...prev,
        cohort: { id: data.cohort.id, url: `/cohort/${data.cohort.id}` },
      }));
      setSuccess(`Created test cohort: ${name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create cohort");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Data Generator</h1>
          <p className="text-muted-foreground">
            Quickly create test results and cohorts for testing flows
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Creates a random result with a subject and score for testing
                the results flow.
              </p>
              <Button
                onClick={createTestResult}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Test Result"
                )}
              </Button>
              {createdItems.result && (
                <div className="rounded-lg border bg-muted p-3">
                  <p className="text-sm font-medium mb-2">Created Result</p>
                  <Link
                    href={createdItems.result.url}
                    className="text-sm text-primary hover:underline"
                  >
                    View Result →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Test Cohort</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Creates a random cohort with a subject for testing the cohort
                flow.
              </p>
              <Button
                onClick={createTestCohort}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Test Cohort"
                )}
              </Button>
              {createdItems.cohort && (
                <div className="rounded-lg border bg-muted p-3">
                  <p className="text-sm font-medium mb-2">Created Cohort</p>
                  <Link
                    href={createdItems.cohort.url}
                    className="text-sm text-primary hover:underline"
                  >
                    View Cohort →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {success && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" />
                <p>{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/results">All Results</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/cohorts">All Cohorts</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/metrics">Metrics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

