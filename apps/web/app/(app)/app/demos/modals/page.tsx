"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeModal } from "@/components/modals/ChallengeModal";
import { ProudParentModal } from "@/components/modals/ProudParentModal";
import { TutorSpotlightModal } from "@/components/modals/TutorSpotlightModal";
import { Target, Heart, BookOpen } from "lucide-react";

export default function ModalsDemo() {
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modal System Demo</h1>
        <p className="text-muted-foreground">
          Test the tall modal system with persona-aware styling
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Challenge Modal */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Challenge Modal</CardTitle>
            <CardDescription>
              For students to challenge friends to compete
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setChallengeOpen(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Open Challenge
            </Button>
          </CardContent>
        </Card>

        {/* Proud Parent Modal */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Proud Parent Modal</CardTitle>
            <CardDescription>
              For parents to share student progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setParentOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Open Parent Share
            </Button>
          </CardContent>
        </Card>

        {/* Tutor Spotlight Modal */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Tutor Spotlight Modal</CardTitle>
            <CardDescription>
              For tutors to showcase their impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setTutorOpen(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Open Tutor Spotlight
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Tall Design:</strong> Optimized for vertical content with scrollable body</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Backdrop Blur:</strong> Blurred background for focused attention</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Persona Colors:</strong> Uses user&apos;s primary/secondary colors for shadows & accents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Rounded Borders:</strong> Large border radius (3xl) for modern feel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Gradient Bar:</strong> Top decorative bar using persona gradient</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Keyboard Support:</strong> Press ESC to close</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span><strong>Body Lock:</strong> Prevents background scrolling when open</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Modals */}
      <ChallengeModal
        isOpen={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        challengeId="demo-challenge-1"
        onComplete={(id, score) => {
          console.log(`Challenge ${id} completed with score: ${score}`);
        }}
      />

      <ProudParentModal
        isOpen={parentOpen}
        onClose={() => setParentOpen(false)}
        studentProgress={{
          studentName: "Alex",
          subject: "Algebra",
          milestones: [
            "Completed 20 practice problems",
            "Earned Math Master badge",
            "Maintained 7-day streak",
          ],
          streak: 7,
          level: 5,
        }}
      />

      <TutorSpotlightModal
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        tutorStats={{
          name: "Ms. Johnson",
          sessionsThisMonth: 42,
          studentCount: 24,
          avgRating: 4.9,
          specialties: ["Algebra", "Geometry", "Calculus"],
        }}
      />
    </div>
  );
}
