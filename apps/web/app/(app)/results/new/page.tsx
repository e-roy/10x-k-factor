"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewResultPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject")?.toString() || undefined;
    const scoreStr = formData.get("score")?.toString();
    const score = scoreStr ? parseInt(scoreStr, 10) : undefined;
    const metadataStr = formData.get("metadata")?.toString();

    let metadata: Record<string, unknown> | undefined;
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        // If not valid JSON, ignore
      }
    }

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          score,
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create result");
      }

      const data = await response.json();
      router.push(`/results/${data.result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create result");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/results">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Result</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="e.g., algebra, geometry, calculus"
                  maxLength={64}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Score (0-100)</Label>
                <Input
                  id="score"
                  name="score"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g., 85"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">
                  Metadata (JSON, optional)
                </Label>
                <Textarea
                  id="metadata"
                  name="metadata"
                  placeholder='{"questions": 20, "correct": 17, "skills": {"understanding": 90, "application": 80}}'
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Enter valid JSON or leave empty
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Result"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/results">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

