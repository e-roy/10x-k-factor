"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, GraduationCap, Users, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingSheetProps {
  open: boolean;
  userId: string;
  currentPersona?: string;
}

const COMMON_SUBJECTS = [
  { id: "algebra", label: "Algebra" },
  { id: "geometry", label: "Geometry" },
  { id: "calculus", label: "Calculus" },
  { id: "math", label: "Math" },
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
];

export function OnboardingSheet({
  open,
  userId: _userId,
  currentPersona,
}: OnboardingSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<string>(currentPersona || "student");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [cohortName, setCohortName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setPersona(currentPersona || "student");
      setSelectedSubjects([]);
      setCohortName("");
      setError(null);
    }
  }, [open, currentPersona]);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !persona) {
      setError("Please select a persona");
      return;
    }
    if (step === 2 && selectedSubjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Update persona
      const personaResponse = await fetch("/api/user/persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
        }),
      });

      if (!personaResponse.ok) {
        throw new Error("Failed to update persona");
      }

      // Create cohort if name provided
      if (cohortName.trim()) {
        await fetch("/api/cohorts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cohortName.trim(),
            subject: selectedSubjects[0] || null,
          }),
        });
      }

      // Mark onboarding as complete
      await fetch("/api/user/onboarding-complete", {
        method: "POST",
      });

      // Redirect to FVM with first subject or default deck
      const deckId = selectedSubjects[0] ? `deck-${selectedSubjects[0]}` : "deck-1";
      router.push(`/fvm/skill/${deckId}`);
    } catch (err) {
      console.error("[OnboardingSheet] Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete onboarding"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/user/onboarding-complete", {
        method: "POST",
      });
      router.refresh();
    } catch (error) {
      console.error("[OnboardingSheet] Failed to skip:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={() => {}}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Welcome to K-Factor!</SheetTitle>
          <SheetDescription>
            Let&apos;s set up your profile to get started
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Step 1: Persona Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Who are you?
                </Label>
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
              </div>
            </div>
          )}

          {/* Step 2: Subject Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  What subjects interest you?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_SUBJECTS.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleSubjectToggle(subject.id)}
                    >
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                      />
                      <Label
                        htmlFor={subject.id}
                        className="cursor-pointer flex-1"
                      >
                        {subject.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cohort Creation */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Create a cohort (optional)
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Cohorts are study groups where you can practice together and
                  compete on leaderboards.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cohortName">Cohort Name</Label>
                  <Input
                    id="cohortName"
                    value={cohortName}
                    onChange={(e) => setCohortName(e.target.value)}
                    placeholder="e.g., Algebra Study Group"
                    maxLength={128}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can skip this and create a cohort later
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

