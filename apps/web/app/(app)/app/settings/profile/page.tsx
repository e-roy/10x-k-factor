"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, GraduationCap, Users, BookOpen, ArrowLeft, Palette, BookMarked } from "lucide-react";
import Link from "next/link";
import { ChromePicker } from "react-color";
import { Checkbox } from "@/components/ui/checkbox";
import { getPersonaPrimaryColor, getPersonaSecondaryColor } from "@/lib/persona-utils";
import { SUBJECTS } from "@/lib/subjects";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<string>("student");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch current user data
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const data = await response.json();
          if (data.persona) {
            setPersona(data.persona);
          }
          // Set subjects from user profile
          if (data.subjects && Array.isArray(data.subjects)) {
            setSubjects(data.subjects);
          }
          // Set custom colors if they exist, otherwise use persona defaults
          setPrimaryColor(data.primaryColor || null);
          setSecondaryColor(data.secondaryColor || null);
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

      // Update persona and subjects
      const personaResponse = await fetch("/api/user/persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          persona,
          subjects: subjects.length > 0 ? subjects : undefined, // Only send if not empty
        }),
      });

      if (!personaResponse.ok) {
        const data = await personaResponse.json();
        throw new Error(data.error || "Failed to update persona");
      }

      // Update colors
      const colorsResponse = await fetch("/api/user/colors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          primaryColor, 
          secondaryColor 
        }),
      });

      if (!colorsResponse.ok) {
        const data = await colorsResponse.json();
        throw new Error(data.error || "Failed to update colors");
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPrimaryColor(null);
    setSecondaryColor(null);
  };

  const handleSubjectToggle = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const currentPrimaryColor = primaryColor || getPersonaPrimaryColor(persona as "student" | "parent" | "tutor");
  const currentSecondaryColor = secondaryColor || getPersonaSecondaryColor(persona as "student" | "parent" | "tutor");

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
          <Link href="/app/settings">
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

        </CardContent>
      </Card>

      {/* Subjects Section - Only for Students */}
      {persona === "student" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Enrolled Subjects
            </CardTitle>
            <CardDescription>
              Select the subjects you&apos;re studying. These will appear in your dashboard and challenges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SUBJECTS.map((subject) => (
                <div
                  key={subject}
                  className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => handleSubjectToggle(subject)}
                >
                  <Checkbox
                    id={`subject-${subject}`}
                    checked={subjects.includes(subject)}
                    onCheckedChange={() => handleSubjectToggle(subject)}
                  />
                  <Label
                    htmlFor={`subject-${subject}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
            {subjects.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No subjects selected. Select at least one subject to see personalized content.
              </div>
            )}
            {subjects.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Colors
          </CardTitle>
          <CardDescription>
            Customize your primary and secondary colors (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div className="space-y-3">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                className="w-20 h-10 rounded-lg border-2 border-border shadow-sm hover:shadow transition-shadow"
                style={{ backgroundColor: currentPrimaryColor }}
              />
              <div className="flex-1">
                <p className="text-sm font-mono">{currentPrimaryColor}</p>
                {!primaryColor && (
                  <p className="text-xs text-muted-foreground">Using persona default</p>
                )}
              </div>
            </div>
            {showPrimaryPicker && (
              <div className="relative">
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowPrimaryPicker(false)}
                  />
                  <ChromePicker
                    color={currentPrimaryColor}
                    onChange={(color) => setPrimaryColor(color.hex)}
                    disableAlpha
                  />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Color */}
          <div className="space-y-3">
            <Label>Secondary Color</Label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                className="w-20 h-10 rounded-lg border-2 border-border shadow-sm hover:shadow transition-shadow"
                style={{ backgroundColor: currentSecondaryColor }}
              />
              <div className="flex-1">
                <p className="text-sm font-mono">{currentSecondaryColor}</p>
                {!secondaryColor && (
                  <p className="text-xs text-muted-foreground">Using persona default</p>
                )}
              </div>
            </div>
            {showSecondaryPicker && (
              <div className="relative">
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowSecondaryPicker(false)}
                  />
                  <ChromePicker
                    color={currentSecondaryColor}
                    onChange={(color) => setSecondaryColor(color.hex)}
                    disableAlpha
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="h-16 rounded-lg mb-4"
              style={{
                background: `linear-gradient(135deg, ${currentPrimaryColor} 0%, ${currentSecondaryColor} 100%)`,
              }}
            />
            <Link href="/app/demos/theme" className="text-sm text-muted-foreground hover:text-foreground">🔗 Admin: Preview persona theme system demo &gt;</Link>
          </div>

          {/* Reset Button */}
          {(primaryColor || secondaryColor) && (
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              Reset to Defaults
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Save Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              Settings updated successfully! Refreshing...
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save All Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
