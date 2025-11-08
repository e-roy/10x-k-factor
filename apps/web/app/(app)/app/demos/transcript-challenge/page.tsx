"use client";

import { useState, useEffect } from "react";
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
import { Loader2, FileText, Sparkles, Target, Database, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CachedTranscript {
  id: string;
  subject: string;
  summary: string;
  transcriptPreview: string;
  fullTranscript: string;
  createdAt: string;
  duration: number | null;
}

export default function TranscriptChallengeDemoPage() {
  const [subject, setSubject] = useState<string>("");
  const [userSubjects, setUserSubjects] = useState<string[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [cachedTranscripts, setCachedTranscripts] = useState<CachedTranscript[]>([]);
  const [isLoadingCached, setIsLoadingCached] = useState(false);
  const [selectedCachedId, setSelectedCachedId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cached" | "generate">("cached");

  // Load user's enrolled subjects on mount
  useEffect(() => {
    async function fetchUserSubjects() {
      setIsLoadingSubjects(true);
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const userData = await response.json();
          // Get subjects from user profile, fallback to empty array
          const subjects = userData.subjects || [];
          setUserSubjects(subjects);
          // Auto-select first subject if available
          if (subjects.length > 0 && !subject) {
            setSubject(subjects[0]);
          }
        }
      } catch (err) {
        console.error("Error loading user subjects:", err);
        // Fallback to default subjects if fetch fails
        setUserSubjects(["Algebra", "Geometry", "Physics"]);
      } finally {
        setIsLoadingSubjects(false);
      }
    }

    fetchUserSubjects();
  }, [subject]);

  // Load cached transcripts on mount
  useEffect(() => {
    loadCachedTranscripts();
  }, []);

  const loadCachedTranscripts = async () => {
    setIsLoadingCached(true);
    try {
      const response = await fetch("/api/tutor-sessions/list");
      if (response.ok) {
        const data = await response.json();
        setCachedTranscripts(data.sessions || []);
      }
    } catch (err) {
      console.error("Error loading cached transcripts:", err);
    } finally {
      setIsLoadingCached(false);
    }
  };

  const handleSelectCached = (cachedId: string) => {
    const cached = cachedTranscripts.find((t) => t.id === cachedId);
    if (cached) {
      setSelectedCachedId(cachedId);
      setTranscript(cached.fullTranscript);
      setSummary(cached.summary);
      setSubject(cached.subject);
      setSessionId(""); // Reset session ID since we're reusing
      setChallengeId(""); // Reset challenge ID
      setError("");
    }
  };

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
      setSelectedCachedId(""); // Clear cached selection when generating new
      // Reload cached transcripts to include the new one
      await loadCachedTranscripts();
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

      // Reload cached transcripts to include the new session
      await loadCachedTranscripts();

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
            Step 1: Select or Generate Transcript &amp; Summary
          </CardTitle>
          <CardDescription>
            Choose a cached transcript or generate a new simulated tutor session transcript with LLM-generated summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2 border-b pb-4">
            <Button
              variant={viewMode === "cached" ? "default" : "ghost"}
              onClick={() => setViewMode("cached")}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Cached Transcripts
              {cachedTranscripts.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {cachedTranscripts.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={viewMode === "generate" ? "default" : "ghost"}
              onClick={() => setViewMode("generate")}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate New
            </Button>
          </div>

          {viewMode === "cached" && (
            <div className="space-y-4">
              {isLoadingCached ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : cachedTranscripts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No cached transcripts found.</p>
                  <p className="text-sm mt-1">Generate a new transcript to get started.</p>
                </div>
              ) : (
                <div className="h-[400px] overflow-y-auto rounded-lg border p-4">
                  <div className="space-y-3">
                    {cachedTranscripts.map((cached) => (
                      <Card
                        key={cached.id}
                        className={cn(
                          "cursor-pointer transition-all hover:border-primary",
                          selectedCachedId === cached.id
                            ? "border-primary bg-primary/5"
                            : ""
                        )}
                        onClick={() => handleSelectCached(cached.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{cached.subject}</Badge>
                                {cached.duration && (
                                  <span className="text-xs text-muted-foreground">
                                    {cached.duration} min
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(cached.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium line-clamp-1">
                                {cached.summary}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {cached.transcriptPreview}
                              </p>
                            </div>
                            {selectedCachedId === cached.id && (
                              <div className="flex-shrink-0">
                                <Badge className="bg-primary">Selected</Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCachedTranscripts}
                  disabled={isLoadingCached}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoadingCached && "animate-spin")} />
                  Refresh
                </Button>
                {selectedCachedId && (
                  <Badge variant="secondary">
                    Transcript loaded - proceed to Step 2
                  </Badge>
                )}
              </div>
            </div>
          )}

          {viewMode === "generate" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject..." />
                  </SelectTrigger>
                <SelectContent>
                  {isLoadingSubjects ? (
                    <SelectItem value="loading" disabled>
                      Loading your subjects...
                    </SelectItem>
                  ) : userSubjects.length > 0 ? (
                    userSubjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No subjects enrolled. Update in Profile Settings.
                    </SelectItem>
                  )}
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
            </div>
          )}

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
