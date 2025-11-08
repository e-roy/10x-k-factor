"use client";

import { useBuddy } from "@/hooks/useBuddy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Zap, Heart } from "lucide-react";
import { AgentBuddy } from "@/components/AgentBuddy";

export default function BuddyDemoPage() {
  const { buddy, isLoading, error } = useBuddy();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Agent Buddy Demo</h1>
          <p className="text-destructive mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Agent Buddy Demo</h1>
          <p className="text-muted-foreground mt-2">No buddy found</p>
        </div>
      </div>
    );
  }

  const moodIcons = {
    calm: <Heart className="h-4 w-4" />,
    fired_up: <Zap className="h-4 w-4" />,
    focused: <Sparkles className="h-4 w-4" />,
  };

  const moodColors = {
    calm: "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100",
    fired_up: "bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100",
    focused: "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Agent Buddy Demo</h1>
        <p className="text-muted-foreground mt-2">
          View your agent buddy&apos;s status, appearance, and progression
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Buddy Visual */}
        <Card>
          <CardHeader>
            <CardTitle>Your Buddy</CardTitle>
            <CardDescription>Level {buddy.level} {buddy.archetype}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <AgentBuddy 
                userId={buddy.userId} 
                persona="student"
                className="scale-150"
              />
            </div>
            
            {/* Level & XP */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium">{Math.round(buddy.progress * 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${buddy.progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {buddy.xp.toLocaleString()} Total XP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buddy Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Buddy Stats</CardTitle>
            <CardDescription>Current state and attributes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Archetype */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Archetype</span>
              <Badge variant="outline" className="font-medium capitalize">
                {buddy.archetype}
              </Badge>
            </div>

            {/* Mood */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mood</span>
              <Badge 
                variant="outline" 
                className={`font-medium capitalize ${moodColors[buddy.state.mood]}`}
              >
                {moodIcons[buddy.state.mood]}
                <span className="ml-1">{buddy.state.mood.replace("_", " ")}</span>
              </Badge>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Energy</span>
                <span className="font-medium">{buddy.state.energy}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ width: `${buddy.state.energy}%` }}
                />
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level</span>
              <Badge variant="secondary" className="font-bold text-lg">
                {buddy.level}
              </Badge>
            </div>

            {/* XP */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <span className="font-semibold">{buddy.xp.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Visual customization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Skin</span>
              <Badge variant="outline">{buddy.appearance.skin}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aura</span>
              <Badge variant="outline">{buddy.appearance.aura}</Badge>
            </div>

            {buddy.appearance.spriteUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sprite</span>
                <a 
                  href={buddy.appearance.spriteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  View
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meta Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
            <CardDescription>Database metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono">{buddy.userId}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(buddy.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm">{new Date(buddy.updatedAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Agent Buddies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Level:</strong> Buddy level matches the student user&apos;s XP level (derived from xp_events)
          </p>
          <p>
            • <strong>Archetype:</strong> Visual theme and personality (wayfinder, guardian, explorer, etc.)
          </p>
          <p>
            • <strong>Mood:</strong> Dynamic state that changes based on recent activity (calm, fired_up, focused)
          </p>
          <p>
            • <strong>Energy:</strong> Idle game mechanic for future features (0-100)
          </p>
          <p>
            • <strong>Appearance:</strong> Customizable skin, aura, and sprite for personalization
          </p>
          <p>
            • <strong>Future:</strong> Inventory items (cosmetics, resources, artifacts), unlocks, and message history
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

