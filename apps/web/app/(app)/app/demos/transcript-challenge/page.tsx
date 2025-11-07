"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Common subjects for the demo
const SUBJECTS = [
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "World History",
];

export default function TranscriptChallengeDemoPage() {
  const [subject, setSubject] = useState<string>("");
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleGenerateTranscript = async () => {
    if (!subject) {
      setError("Please select a subject first");
      return;
    }

    setError("");
    setIsGeneratingTranscript(true);
    setTranscript("");
    setSummary("");
    setSessionId("");
    setChallengeId("");

    try {
      const response = await fetch("/api/challenges/generate-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          studentLevel: "intermediate",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate transcript");
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error generating transcript:", err);
      setError(err instanceof Error ? err.message : "Failed to generate transcript");
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleCreateSession = async () => {
    if (!transcript || !summary || !subject) {
      setError("Generate transcript first");
      return;
    }

    setError("");
    setIsCreatingSession(true);

    try {
      const response = await fetch("/api/tutor-sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          summary,
          subject,
          duration: 30, // Mock 30-minute session
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setChallengeId(data.challengeId);

      // Trigger a page event to notify Agent Buddy
      window.dispatchEvent(
        new CustomEvent("challengeGenerated", {
          detail: {
            challengeId: data.challengeId,
            subject,
          },
        })
      );
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">
          Transcript &amp; Challenge Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Demo/Test tool for generating simulated tutor sessions and triggering
          challenge creation via Loop Orchestrator
        </p>
      </div>

      {/* Step 1: Select Subject & Generate Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Step 1: Generate Transcript &amp; Summary
          </CardTitle>
          <CardDescription>
            Select a subject and generate a simulated tutor session transcript with LLM-generated summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject..." />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateTranscript}
              disabled={!subject || isGeneratingTranscript}
            >
              {isGeneratingTranscript ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Transcript
                </>
              )}
            </Button>
            <Badge variant="outline">
              Using: {process.env.NEXT_PUBLIC_LLM_PROVIDER || "OpenAI"}
            </Badge>
          </div>

          {transcript && (
            <div className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label>Generated Transcript</Label>
                <div className="p-4 bg-muted rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {transcript}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Generated Summary</Label>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{summary}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Create Session & Generate Challenge */}
      {transcript && summary && (
        <Card className={sessionId ? "border-green-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Step 2: Create Session &amp; Generate Challenge
            </CardTitle>
            <CardDescription>
              This will save the tutor session to the database and trigger the
              Loop Orchestrator to generate a challenge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCreateSession}
              disabled={isCreatingSession || !!sessionId}
              className="w-full"
            >
              {isCreatingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Session &amp; Generating Challenge...
                </>
              ) : sessionId ? (
                <>
                  ✓ Session Created &amp; Challenge Generated
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Create Session &amp; Generate Challenge
                </>
              )}
            </Button>

            {sessionId && challengeId && (
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <Label className="text-green-900 dark:text-green-100">
                    Success! 🎉
                  </Label>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Tutor session created and challenge generated. The Agent
                    Buddy should now display a speech bubble with the challenge!
                  </p>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-semibold">{sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challenge ID:</span>
                    <span className="font-semibold">{challengeId}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How This Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>
              Select a subject from the dropdown (these represent enrolled classes)
            </li>
            <li>
              Click &quot;Generate Transcript&quot; to create a simulated tutor session using LLM
            </li>
            <li>
              Review the generated transcript and summary
            </li>
            <li>
              Click &quot;Create Session &amp; Generate Challenge&quot; to:
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>Save the tutor session to the database</li>
                <li>Trigger the Loop Orchestrator to generate a 5-question challenge</li>
                <li>Display the challenge in Agent Buddy&apos;s speech bubble</li>
              </ul>
            </li>
            <li>
              The Agent Buddy will show a notification badge and display a speech bubble with a link to take the challenge
            </li>
            <li>
              The speech bubble persists until the student completes the challenge
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

