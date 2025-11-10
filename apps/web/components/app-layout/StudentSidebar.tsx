"use client";

import { AgentBuddy } from "@/components/AgentBuddy";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Shield, Users, Zap, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StudentSidebarProps {
  userId: string;
  userName: string | null | undefined;
  persona: "student" | "parent" | "tutor";
  data: {
    xp: number;
    level: number;
    streak: number;
    streakAtRisk: boolean;
    badges: Array<{
      id: string;
      name: string;
      icon: string;
      earnedAt: Date;
    }>;
    subjects: Array<{
      name: string;
      activeUsers: number;
      totalXp: number;
      currentStreak: number;
      longestStreak: number;
    }>;
    cohorts: Array<{
      id: string;
      name: string;
      subject: string;
      activeUsers: number;
    }>;
  };
}

export function StudentSidebar({ userId, persona, data }: StudentSidebarProps) {
  return (
    <aside className="max-w-[260px] flex-shrink-0 overflow-visible p-4 space-y-6 bg-background/50 border-l">
      {/* Agent Buddy Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <AgentBuddy 
            userId={userId} 
            persona={persona} 
            className="scale-125"
          />
        </div>
        
        {/* XP & Level */}
        <Card className="p-3 bg-persona-overlay border-persona">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-2xl font-bold text-persona-primary">{data.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">XP</p>
              <p className="text-lg font-semibold">{data.xp.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Streak Section */}
      <div className="space-y-2">
        <Card className={cn(
          "p-3",
          data.streakAtRisk 
            ? "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-300"
            : "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-semibold text-orange-900 dark:text-orange-100">
                {data.streak} Day Streak
              </p>
              {data.streakAtRisk && (
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  At risk! Practice today
                </p>
              )}
            </div>
          </div>
          
          {data.streakAtRisk && (
            <Button 
              asChild 
              size="sm" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Link href="/fvm/skill/deck-1">
                <Shield className="mr-2 h-4 w-4" />
                Streak Rescue
              </Link>
            </Button>
          )}
        </Card>
      </div>

      {/* Badges Section */}
      {/* {data.badges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-persona-primary" />
              Recent Badges
            </h3>
            <Link href="/app/rewards" className="text-xs text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.badges.slice(0, 6).map((badge) => (
              <button
                key={badge.id}
                className="aspect-square rounded-lg bg-persona-overlay border-persona hover:scale-105 transition-transform flex items-center justify-center text-2xl"
                title={badge.name}
              >
                {badge.icon}
              </button>
            ))}
          </div>
        </div>
      )} */}

      {/* Subjects Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">My Subjects</h3>
          <Link href="/app/settings" className="text-xs text-muted-foreground hover:text-foreground">
            Edit
          </Link>
        </div>
        {data.subjects.length === 0 ? (
          <Card className="p-3 text-center">
            <p className="text-xs text-muted-foreground mb-2">No subjects enrolled</p>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/app/settings">Add Subjects</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {data.subjects.map((subject) => {
              const isBestStreak = subject.currentStreak > 0 && subject.currentStreak === subject.longestStreak;
              
              return (
                <Card 
                  key={subject.name}
                  className={cn(
                    "p-2.5 hover:bg-accent cursor-pointer transition-all",
                    isBestStreak && "border-yellow-400/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/10 dark:to-orange-950/10 shadow-sm"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{subject.name}</span>
                      {subject.activeUsers > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {subject.activeUsers} online
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{subject.totalXp.toLocaleString()} XP</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1",
                        isBestStreak 
                          ? "text-yellow-600 dark:text-yellow-400 font-semibold" 
                          : "text-muted-foreground"
                      )}>
                        {isBestStreak && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                        <Flame className={cn("h-3 w-3", isBestStreak && "text-yellow-600 dark:text-yellow-400")} />
                        <span>{subject.currentStreak} streak</span>
                        {isBestStreak && (
                          <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0 border-yellow-400 text-yellow-600 dark:text-yellow-400">
                            Best!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cohorts Section */}
      {data.cohorts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">My Cohorts</h3>
            <Link href="/app/cohorts" className="text-xs text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>
          <div className="space-y-1.5">
            {data.cohorts.slice(0, 5).map((cohort) => (
              <Link key={cohort.id} href={`/cohort/${cohort.id}`}>
                <Card className="p-2 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cohort.name}</span>
                    {cohort.activeUsers > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {cohort.activeUsers}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{cohort.subject}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
