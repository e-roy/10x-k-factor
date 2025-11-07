# Quick Start: UI Implementation Guide

## Getting Started

This guide will help you start implementing the persona-based UI on top of the existing backend.

---

## Prerequisites

✅ You have:
- Read the main PRD (`docs/prd-ui-persona-integration.md`)
- Reviewed the MCP agent guide (`docs/mcp-agent-integration-guide.md`)
- Scanned the visual architecture (`docs/architecture-visual-flow.md`)
- Confirmed dev server is running (`pnpm dev`)

---

## Step 1: Create Persona Utility Functions

**File:** `apps/web/lib/persona-utils.ts`

```typescript
export type Persona = "student" | "parent" | "tutor";

export interface PersonaStyles {
  bgGradient: string;
  textColor: string;
  iconColor: string;
  badgeStyle: "playful" | "professional";
  primary: string;
  secondary: string;
}

export const PERSONA_STYLES: Record<Persona, PersonaStyles> = {
  student: {
    bgGradient: "from-purple-500/10 to-pink-500/10",
    textColor: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-500",
    badgeStyle: "playful",
    primary: "#8B5CF6", // purple-500
    secondary: "#EC4899", // pink-500
  },
  parent: {
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    textColor: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-500",
    badgeStyle: "professional",
    primary: "#3B82F6", // blue-500
    secondary: "#06B6D4", // cyan-500
  },
  tutor: {
    bgGradient: "from-green-500/10 to-emerald-500/10",
    textColor: "text-green-700 dark:text-green-300",
    iconColor: "text-green-500",
    badgeStyle: "professional",
    primary: "#10B981", // green-500
    secondary: "#059669", // green-600
  },
};

export function getPersonaStyles(persona: Persona): PersonaStyles {
  return PERSONA_STYLES[persona];
}

export function getPersonaDisplayName(persona: Persona): string {
  const names: Record<Persona, string> = {
    student: "Student",
    parent: "Parent",
    tutor: "Tutor",
  };
  return names[persona];
}

export function getPersonaIcon(persona: Persona): string {
  const icons: Record<Persona, string> = {
    student: "🎓",
    parent: "👨‍👩‍👧‍👦",
    tutor: "📚",
  };
  return icons[persona];
}
```

---

## Step 2: Create Agent Buddy Hook

**File:** `apps/web/hooks/useAgentBuddy.ts`

```typescript
"use client";

import { useEffect, useState } from "react";
import type { OrchestratorOutput, PersonalizeOutput } from "@10x-k-factor/agents";

export interface SpeechBubble {
  id: string;
  copy: string;
  action?: {
    type: "navigate" | "modal";
    target: string;
    label?: string;
  };
  rewardPreview?: {
    type: string;
    amount?: number;
    description?: string;
  };
  priority: "high" | "normal" | "low";
  expiresAt?: Date;
}

interface UseAgentBuddyOptions {
  userId: string;
  persona: "student" | "parent" | "tutor";
  currentContext?: {
    page?: string;
    subject?: string;
    recentEvent?: string;
  };
}

export function useAgentBuddy(options: UseAgentBuddyOptions) {
  const { userId, persona, currentContext } = options;
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch agent decision when context changes
  useEffect(() => {
    if (!currentContext?.recentEvent) return;

    const fetchAgentDecision = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Ask orchestrator which loop to trigger
        const orchResponse = await fetch("/api/orchestrator/choose_loop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: currentContext.recentEvent,
            persona,
            subject: currentContext.subject,
            cooldowns: {}, // TODO: Fetch from user state
          }),
        });

        if (!orchResponse.ok) {
          throw new Error("Orchestrator API failed");
        }

        const orchData: OrchestratorOutput = await orchResponse.json();

        // 2. Get personalized copy
        const persResponse = await fetch("/api/personalize/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: "share_invite",
            persona,
            subject: currentContext.subject,
            loop: orchData.loop,
          }),
        });

        if (!persResponse.ok) {
          throw new Error("Personalization API failed");
        }

        const persData: PersonalizeOutput = await persResponse.json();

        // 3. Create speech bubble
        const newBubble: SpeechBubble = {
          id: `bubble-${Date.now()}`,
          copy: persData.copy,
          action: {
            type: "modal",
            target: "ChallengeModal",
            label: "Create Challenge",
          },
          rewardPreview: persData.reward_preview,
          priority: "high",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        };

        setSpeechBubbles((prev) => [newBubble, ...prev]);
      } catch (err) {
        console.error("[useAgentBuddy] Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDecision();
  }, [currentContext?.recentEvent, persona, userId, currentContext?.subject]);

  const dismissBubble = (id: string) => {
    setSpeechBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  const addBubble = (bubble: Omit<SpeechBubble, "id">) => {
    setSpeechBubbles((prev) => [
      {
        ...bubble,
        id: `bubble-${Date.now()}-${Math.random()}`,
      },
      ...prev,
    ]);
  };

  return {
    currentBubble: speechBubbles[0] || null,
    bubbleQueue: speechBubbles,
    isLoading,
    error,
    dismissBubble,
    addBubble,
  };
}
```

---

## Step 3: Build Agent Buddy Component

**File:** `apps/web/components/AgentBuddy.tsx`

```typescript
"use client";

import { useAgentBuddy } from "@/hooks/useAgentBuddy";
import { getPersonaStyles } from "@/lib/persona-utils";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AgentBuddyProps {
  userId: string;
  persona: "student" | "parent" | "tutor";
  className?: string;
}

export function AgentBuddy({ userId, persona, className }: AgentBuddyProps) {
  const { currentBubble, dismissBubble } = useAgentBuddy({
    userId,
    persona,
    currentContext: {
      page: "dashboard",
      // These would be set dynamically based on user actions
    },
  });

  const styles = getPersonaStyles(persona);

  if (!currentBubble) {
    return (
      <div className={cn("relative", className)}>
        {/* Agent buddy idle state */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-muted">
          <img
            src="/icons/agent-buddy-idle.gif"
            alt="Agent Buddy"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Agent buddy active state */}
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary animate-pulse">
        <img
          src="/icons/agent-buddy-active.gif"
          alt="Agent Buddy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Speech bubble */}
      <div
        className={cn(
          "absolute top-0 right-full mr-3 w-72 p-4 rounded-2xl shadow-lg",
          "border border-border bg-background",
          "animate-in slide-in-from-right-5 fade-in duration-300"
        )}
        style={{
          background: `linear-gradient(135deg, ${styles.primary}15 0%, ${styles.secondary}15 100%)`,
        }}
      >
        {/* Dismiss button */}
        <button
          onClick={() => dismissBubble(currentBubble.id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Speech bubble content */}
        <div className="space-y-3">
          <p className="text-sm font-medium">{currentBubble.copy}</p>

          {/* Reward preview */}
          {currentBubble.rewardPreview && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {currentBubble.rewardPreview.type === "streak_shield"
                  ? "🛡️"
                  : currentBubble.rewardPreview.type === "ai_minutes"
                    ? "🤖"
                    : currentBubble.rewardPreview.type === "badge"
                      ? "🏆"
                      : "💎"}
              </span>
              <span>{currentBubble.rewardPreview.description}</span>
            </div>
          )}

          {/* Action button */}
          {currentBubble.action && (
            <Button
              size="sm"
              className="w-full"
              style={{
                background: `linear-gradient(135deg, ${styles.primary} 0%, ${styles.secondary} 100%)`,
              }}
              onClick={() => {
                // TODO: Handle action (navigate or open modal)
                console.log("Action clicked:", currentBubble.action);
              }}
            >
              {currentBubble.action.label || "Let's Go!"}
            </Button>
          )}
        </div>

        {/* Speech bubble tail (pointing right) */}
        <div
          className="absolute top-6 -right-2 w-4 h-4 rotate-45"
          style={{
            background: `linear-gradient(135deg, ${styles.primary}15 0%, ${styles.secondary}15 100%)`,
            borderRight: "1px solid hsl(var(--border))",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        />
      </div>
    </div>
  );
}
```

---

## Step 4: Update Header to Include Agent Buddy

**File:** `apps/web/components/app-layout/HeaderContent.tsx`

```typescript
"use client";

import { CohortSwitcher } from "@/components/CohortSwitcher";
import { PresencePill } from "@/components/PresencePill";
import { UserMenu } from "@/components/app-layout/UserMenu";
import { AgentBuddy } from "@/components/AgentBuddy";
import { Command } from "lucide-react";
import { useCohort } from "@/components/app-layout/CohortContext";

interface HeaderContentProps {
  userId: string;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
  persona: "student" | "parent" | "tutor"; // NEW
}

export function HeaderContent({
  userId,
  userName,
  userEmail,
  userImage,
  persona,
}: HeaderContentProps) {
  const { selectedCohortSubject } = useCohort();

  return (
    <>
      <CohortSwitcher userId={userId} />
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded border border-transparent hover:border-border transition-colors"
          title="Command palette (⌘K)"
        >
          <Command className="h-3.5 w-3.5" />
          <kbd className="hidden sm:inline-block">⌘K</kbd>
        </button>
        <PresencePill subject={selectedCohortSubject || "algebra"} />
        
        {/* NEW: Agent Buddy */}
        <AgentBuddy userId={userId} persona={persona} />
        
        <UserMenu name={userName} email={userEmail} image={userImage} />
      </div>
    </>
  );
}
```

**Update the layout to pass persona:**

**File:** `apps/web/app/(app)/layout.tsx`

```typescript
// ... existing imports

export default async function AppLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  const showAdmin = session.user.role === "admin";
  const persona = session.user.persona || "student"; // NEW

  return (
    <CohortProvider>
      <InviteJoinedTracker />
      <CommandPalette />
      <div className="grid grid-cols-[260px_1fr] min-h-screen">
        <aside className="border-r bg-background p-4 flex flex-col">
          <Link href="/app" className="font-semibold text-lg block mb-6">
            K-Factor
          </Link>
          <SidebarNav showAdmin={showAdmin} />
          <div className="mt-auto pt-4">
            <InviteButton
              userId={session.user.id}
              persona={persona} // Updated
              variant="default"
              size="sm"
              className="w-full"
            />
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
            <HeaderContent
              userId={session.user.id}
              userName={session.user.name}
              userEmail={session.user.email}
              userImage={session.user.image}
              persona={persona} // NEW
            />
          </header>
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </CohortProvider>
  );
}
```

---

## Step 5: Create Radial Progress Widget (Student)

**File:** `apps/web/components/RadialProgressWidget.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import { getPersonaStyles } from "@/lib/persona-utils";

interface RadialProgressWidgetProps {
  subject: string;
  progress: number; // 0-100
  level: number;
  xp: number;
  xpToNextLevel: number;
  className?: string;
  onClick?: () => void;
}

export function RadialProgressWidget({
  subject,
  progress,
  level,
  xp,
  xpToNextLevel,
  className,
  onClick,
}: RadialProgressWidgetProps) {
  const styles = getPersonaStyles("student");
  
  // Calculate stroke dash array for progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // XP progress to next level
  const xpProgress = (xp / xpToNextLevel) * 100;
  const xpOffset = circumference - (xpProgress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group rounded-2xl p-6",
        "border border-border bg-gradient-to-br",
        styles.bgGradient,
        "hover:shadow-lg transition-all duration-300",
        "hover:scale-105",
        className
      )}
    >
      {/* SVG Progress Rings */}
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circles */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted opacity-20"
          />
          <circle
            cx="80"
            cy="80"
            r={radius - 15}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted opacity-20"
          />

          {/* Outer progress ring (subject progress) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={styles.primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
            style={{
              filter: `drop-shadow(0 0 6px ${styles.primary})`,
            }}
          />

          {/* Inner progress ring (XP to next level) */}
          <circle
            cx="80"
            cy="80"
            r={radius - 15}
            fill="none"
            stroke={styles.secondary}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={xpOffset}
            className="transition-all duration-500"
            style={{
              filter: `drop-shadow(0 0 4px ${styles.secondary})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold mb-1">
            {level}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Level
          </div>
        </div>
      </div>

      {/* Subject name */}
      <div className="mt-4 text-center">
        <h3 className="font-semibold text-lg">{subject}</h3>
        <p className="text-sm text-muted-foreground">
          {Math.round(progress)}% Complete
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {xp} / {xpToNextLevel} XP
        </p>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"
        style={{
          background: `radial-gradient(circle at center, ${styles.primary}20 0%, transparent 70%)`,
        }}
      />
    </button>
  );
}
```

---

## Step 6: Create Student Dashboard

**File:** `apps/web/components/dashboards/StudentDashboard.tsx`

```typescript
import { RadialProgressWidget } from "@/components/RadialProgressWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Users, Target } from "lucide-react";
import Link from "next/link";

interface StudentDashboardProps {
  user: {
    id: string;
    name?: string | null;
    persona: string;
  };
  data: {
    subjects: Array<{
      name: string;
      progress: number;
      level: number;
      xp: number;
      xpToNextLevel: number;
    }>;
    streak: number;
    friendsOnline: number;
    challenges: Array<{
      id: string;
      subject: string;
      from: string;
    }>;
  };
}

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Welcome back, {user.name?.split(" ")[0] || "Champion"}! 🎯
        </h1>
        <p className="text-muted-foreground mt-2">
          Ready to level up today?
        </p>
      </div>

      {/* Progress Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.subjects.map((subject) => (
            <RadialProgressWidget
              key={subject.name}
              subject={subject.name}
              progress={subject.progress}
              level={subject.level}
              xp={subject.xp}
              xpToNextLevel={subject.xpToNextLevel}
              onClick={() => {
                // Navigate to subject practice
                window.location.href = `/fvm/skill/deck-1?subject=${subject.name}`;
              }}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Streak Card */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {data.streak} Day Streak
              </CardTitle>
              <CardDescription>
                {data.streak === 0
                  ? "Start your streak today!"
                  : "Keep it going!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/fvm/skill/deck-1">Practice Now</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Study Buddies */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                {data.friendsOnline} Friends Online
              </CardTitle>
              <CardDescription>Join a study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/app/cohorts">View Cohorts</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Challenges */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {data.challenges.length} Challenges
              </CardTitle>
              <CardDescription>Waiting for you</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/app/results">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

---

## Step 7: Update Main Dashboard to Use Persona

**File:** `apps/web/app/(app)/app/page.tsx`

```typescript
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { users, results } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
// TODO: Import ParentDashboard and TutorDashboard when ready

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;
  const persona = session.user.persona || "student";

  // Fetch user data
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Fetch persona-specific data
  const dashboardData = await fetchDashboardData(userId, persona);

  return (
    <>
      <OnboardingWrapper
        userId={userId}
        currentPersona={persona}
        onboardingCompleted={user?.onboardingCompleted ?? false}
      />
      
      {persona === "student" && (
        <StudentDashboard
          user={{ id: userId, name: user?.name, persona }}
          data={dashboardData}
        />
      )}
      
      {persona === "parent" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">Coming soon...</p>
          {/* TODO: Render ParentDashboard */}
        </div>
      )}
      
      {persona === "tutor" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
          <p className="text-muted-foreground">Coming soon...</p>
          {/* TODO: Render TutorDashboard */}
        </div>
      )}
    </>
  );
}

// Helper function to fetch dashboard data
async function fetchDashboardData(userId: string, persona: string) {
  // For now, return mock data
  // TODO: Implement real data fetching from DB
  
  if (persona === "student") {
    return {
      subjects: [
        {
          name: "Algebra",
          progress: 65,
          level: 5,
          xp: 320,
          xpToNextLevel: 500,
        },
        {
          name: "Geometry",
          progress: 42,
          level: 3,
          xp: 180,
          xpToNextLevel: 300,
        },
        {
          name: "Calculus",
          progress: 28,
          level: 2,
          xp: 90,
          xpToNextLevel: 200,
        },
      ],
      streak: 5,
      friendsOnline: 12,
      challenges: [],
    };
  }
  
  // TODO: Add parent and tutor data
  return {};
}
```

---

## Step 8: Test Your Implementation

### 1. Start the dev server (if not running)

```bash
cd apps/web
pnpm dev
```

### 2. Visit the dashboard

```
http://localhost:3000/app
```

### 3. You should see:

✅ Agent buddy in top-right (static for now)  
✅ Radial progress widgets for student persona  
✅ Persona-specific colors and styling  
✅ Quick action cards with streak, friends, challenges  

### 4. Test the orchestrator

Open browser console and run:

```javascript
fetch("/api/orchestrator/choose_loop", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event: "session_complete",
    persona: "student",
    subject: "Algebra",
    cooldowns: {}
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

Expected output:
```json
{
  "loop": "buddy_challenge",
  "eligibility_reason": "cooldown_ok",
  "rationale": "Selected buddy_challenge for student after session_complete in Algebra. Cooldown period satisfied.",
  "features_used": [...],
  "latency_ms": 8
}
```

### 5. Test the personalization

```javascript
fetch("/api/personalize/compose", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    intent: "challenge_friend",
    persona: "student",
    subject: "Algebra",
    loop: "buddy_challenge"
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

Expected output:
```json
{
  "copy": "I just completed an Algebra session! Challenge me to beat your score? 🎯",
  "deep_link_params": {...},
  "reward_preview": {
    "type": "streak_shield",
    "amount": 1,
    "description": "Get a streak shield when your friend completes the challenge"
  },
  "rationale": "...",
  "features_used": [...]
}
```

---

## Next Steps

### Phase 1 (This Week)

- [ ] Add placeholder images for agent buddy (`/public/icons/agent-buddy-*.gif`)
- [ ] Implement modal system (`TallModal.tsx`)
- [ ] Build `ChallengeModal.tsx` with share functionality
- [ ] Wire up smart link generation in modal
- [ ] Add celebration animations for rewards
- [ ] Create Parent and Tutor dashboard skeletons

### Phase 2 (Next Week)

- [ ] Implement real-time reward notifications
- [ ] Add SSE/polling for agent buddy updates
- [ ] Build share card generation (`/api/og` integration)
- [ ] Add WhatsApp share integration
- [ ] Implement cooldown tracking UI
- [ ] Polish animations and transitions

### Phase 3 (Week 3)

- [ ] Complete Parent dashboard (progress overview, safe sharing)
- [ ] Complete Tutor dashboard (spotlight cards, metrics)
- [ ] Add presence integration in agent buddy
- [ ] Implement leaderboard widgets
- [ ] Add empty states and error handling
- [ ] Mobile responsive improvements

---

## Troubleshooting

### Agent buddy not showing

**Check:**
1. Is persona set correctly in session?
2. Is `AgentBuddy` component imported in `HeaderContent`?
3. Are there console errors?

**Debug:**
```typescript
console.log("Persona:", session.user.persona);
console.log("Current bubble:", currentBubble);
```

### Orchestrator API not responding

**Check:**
1. Is dev server running?
2. Is API route file present at `/api/orchestrator/choose_loop/route.ts`?
3. Are there TypeScript errors in the agent package?

**Test manually:**
```bash
curl -X POST http://localhost:3000/api/orchestrator/choose_loop \
  -H "Content-Type: application/json" \
  -d '{"event":"session_complete","persona":"student","cooldowns":{}}'
```

### Radial widget not rendering

**Check:**
1. Are SVG dimensions correct?
2. Is progress value between 0-100?
3. Are Tailwind classes working (check `tailwind.config.ts`)?

**Debug:**
```typescript
console.log("Progress:", progress);
console.log("Offset:", offset);
console.log("Circumference:", circumference);
```

---

## Resources

- **PRD:** `docs/prd-ui-persona-integration.md`
- **MCP Guide:** `docs/mcp-agent-integration-guide.md`
- **Architecture:** `docs/architecture-visual-flow.md`
- **Existing Components:** `apps/web/components/`
- **Agent Types:** `packages/agents/src/types.ts`
- **Tailwind Docs:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com

---

## Getting Help

**Questions?**
- Backend integration: Check with backend engineer
- Agent behavior: Review `packages/agents/src/orchestrator.agent.ts`
- UI components: Check existing shadcn/ui components in `apps/web/components/ui/`

**Stuck?**
- Review the PRD for context
- Check the visual architecture diagram
- Test API endpoints directly (use curl or browser console)
- Add console.logs liberally during development

---

**Happy coding! 🚀**

_Last Updated: November 7, 2025_

