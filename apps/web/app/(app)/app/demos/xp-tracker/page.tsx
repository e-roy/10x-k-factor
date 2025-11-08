"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, TrendingUp, Award } from "lucide-react";
import { XP_EVENT_TYPE_VALUES } from "@/db/types";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  persona: string;
}

interface XpBalance {
  xp: number;
  level: number;
  progress: number;
  nextNeeded: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export default function XpTrackerDemoPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("student");
  const [rawXp, setRawXp] = useState<string>("1");
  const [subject, setSubject] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");
  
  const [xpBalance, setXpBalance] = useState<XpBalance | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingXp, setIsLoadingXp] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        // Fetch all users from database (mock for now - would need an admin API)
        // For demo purposes, we'll use the current user
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const currentUser = await response.json();
          setUsers([currentUser]);
          setSelectedUserId(currentUser.id);
          setSelectedPersona(currentUser.persona || "student");
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    }

    fetchUsers();
  }, []);

  // Fetch XP balance when user changes
  useEffect(() => {
    if (!selectedUserId) return;

    async function fetchXpBalance() {
      setIsLoadingXp(true);
      try {
        const response = await fetch(`/api/xp/balance`);
        if (response.ok) {
          const data = await response.json();
          setXpBalance(data);
        } else {
          setXpBalance({ xp: 0, level: 0, progress: 0, nextNeeded: 100, currentLevelXp: 0, nextLevelXp: 100 });
        }
      } catch (err) {
        console.error("Failed to fetch XP balance:", err);
        setXpBalance({ xp: 0, level: 0, progress: 0, nextNeeded: 100, currentLevelXp: 0, nextLevelXp: 100 });
      } finally {
        setIsLoadingXp(false);
      }
    }

    fetchXpBalance();
  }, [selectedUserId]);

  const handleTrackXp = async () => {
    if (!selectedUserId || !selectedEventType) {
      setError("Please select a user and event type");
      return;
    }

    setIsTracking(true);
    setError(null);
    setSuccess(null);

    try {
      const metadata: Record<string, unknown> = {};
      if (subject) metadata.subject = subject;
      if (referenceId) metadata.referenceId = referenceId;

      const response = await fetch("/api/xp/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaType: selectedPersona,
          eventType: selectedEventType,
          referenceId: referenceId || undefined,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          rawXp: parseInt(rawXp) || 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`XP tracked! New total: ${data.xp} XP (Level ${data.level})`);
        
        // Update balance display
        setXpBalance({
          xp: data.xp,
          level: data.level,
          progress: data.progress,
          nextNeeded: data.nextNeeded,
          currentLevelXp: data.currentLevelXp || 0,
          nextLevelXp: data.nextLevelXp || 0,
        });

        // Clear form
        setSubject("");
        setReferenceId("");
        setRawXp("1");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to track XP");
      }
    } catch (err) {
      console.error("Error tracking XP:", err);
      setError("Network error - failed to track XP");
    } finally {
      setIsTracking(false);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">XP Tracker Demo</h1>
        <p className="text-muted-foreground mt-2">
          Manually track XP events for testing the XP system and level progression.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* XP Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Current XP Balance
            </CardTitle>
            <CardDescription>Real-time XP and level from database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingXp ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : xpBalance ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-3xl font-bold text-primary">
                      {xpBalance.xp.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-3xl font-bold text-primary">
                      {xpBalance.level}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level Progress</span>
                    <span className="font-medium">
                      {Math.round(xpBalance.progress * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${xpBalance.progress * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {xpBalance.nextNeeded} XP to Level {xpBalance.level + 1}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No XP data</p>
            )}
          </CardContent>
        </Card>

        {/* Track XP Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Track XP Event
            </CardTitle>
            <CardDescription>Add XP manually for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} ({user.persona})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Persona Selection */}
            <div className="space-y-2">
              <Label htmlFor="persona">Persona</Label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger id="persona">
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {XP_EVENT_TYPE_VALUES.map((eventType) => (
                    <SelectItem key={eventType} value={eventType}>
                      {eventType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Raw XP */}
            <div className="space-y-2">
              <Label htmlFor="raw-xp">Raw XP (before multiplier)</Label>
              <Input
                id="raw-xp"
                type="number"
                min="1"
                value={rawXp}
                onChange={(e) => setRawXp(e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Optional Fields */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., algebra, geometry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-id">Reference ID (optional)</Label>
              <Input
                id="reference-id"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g., challenge-123"
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100 text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              onClick={handleTrackXp} 
              disabled={isTracking || !selectedUserId || !selectedEventType}
              className="w-full"
            >
              {isTracking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Track XP Event
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Event Types:</strong> Each event type has a multiplier (e.g., challenge.completed ×5, invite.accepted ×20)
          </p>
          <p>
            • <strong>Raw XP:</strong> Base XP amount before applying the multiplier (usually 1)
          </p>
          <p>
            • <strong>Final XP:</strong> Raw XP × Event Multiplier (calculated automatically)
          </p>
          <p>
            • <strong>Levels:</strong> Quadratic curve: Level {"{"}n{"}"} requires 40n² + 60n total XP
          </p>
          <p>
            • <strong>Immutable Log:</strong> All XP events are permanently recorded and never modified
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

