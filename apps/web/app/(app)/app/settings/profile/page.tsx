"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, GraduationCap, Users, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<string>("student");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch current user data
    async function fetchUserData() {
      try {
        // We'll get persona from session via server component wrapper
        // For now, use a simple fetch
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const data = await response.json();
          if (data.persona) {
            setPersona(data.persona);
          }
        }
      } catch (error) {
        console.error("[ProfileSettings] Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/user/persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ persona }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update persona");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update persona");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/settings/rewards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persona</CardTitle>
          <CardDescription>
            Select your role to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={persona} onValueChange={setPersona}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="student" id="student" />
              <Label
                htmlFor="student"
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <GraduationCap className="h-5 w-5" />
                <div>
                  <div className="font-medium">Student</div>
                  <div className="text-xs text-muted-foreground">
                    I&apos;m here to practice and learn
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="parent" id="parent" />
              <Label
                htmlFor="parent"
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <Users className="h-5 w-5" />
                <div>
                  <div className="font-medium">Parent</div>
                  <div className="text-xs text-muted-foreground">
                    I&apos;m supporting my child&apos;s learning
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent">
              <RadioGroupItem value="tutor" id="tutor" />
              <Label
                htmlFor="tutor"
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <BookOpen className="h-5 w-5" />
                <div>
                  <div className="font-medium">Tutor</div>
                  <div className="text-xs text-muted-foreground">
                    I&apos;m teaching and creating content
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              Persona updated successfully! Refreshing...
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

