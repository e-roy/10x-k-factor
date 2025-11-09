"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { seedUsersAndResults, quickSeed, type SeedResult } from "./actions";
import { CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";

export function SeedForm() {
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const [formData, setFormData] = useState({
    userCount: 5,
    resultsPerUser: 3,
    subjects: "algebra,geometry,calculus",
    scoreMin: 60,
    scoreMax: 100,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const result = await seedUsersAndResults(formData);
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async () => {
    setQuickLoading(true);
    setResult(null);

    try {
      const result = await quickSeed();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Seed Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Seed
          </CardTitle>
          <CardDescription>
            Quickly create 15 users with realistic names and varied activity
            levels across common subjects (algebra, geometry, calculus, physics,
            chemistry). Creates a natural leaderboard spread with top
            performers, average users, and beginners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleQuickSeed}
            disabled={quickLoading || loading}
            variant="outline"
          >
            {quickLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Quick Seed
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Seed Form */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Seed</CardTitle>
          <CardDescription>
            Create custom test data for leaderboard testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userCount">Number of Users</Label>
                <Input
                  id="userCount"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.userCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userCount: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Between 1 and 50
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultsPerUser">Results per User</Label>
                <Input
                  id="resultsPerUser"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.resultsPerUser}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resultsPerUser: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Between 1 and 20
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects (comma-separated)</Label>
              <Input
                id="subjects"
                type="text"
                value={formData.subjects}
                onChange={(e) =>
                  setFormData({ ...formData, subjects: e.target.value })
                }
                placeholder="algebra,geometry,calculus"
                required
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple subjects with commas (e.g.,
                algebra,geometry,calculus)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scoreMin">Min Score</Label>
                <Input
                  id="scoreMin"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoreMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scoreMin: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scoreMax">Max Score</Label>
                <Input
                  id="scoreMax"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoreMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scoreMax: parseInt(e.target.value) || 100,
                    })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading || quickLoading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                "Create Seed Data"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Seed Successful
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Seed Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>{result.usersCreated}</strong> users created
                </p>
                <p className="text-sm">
                  <strong>{result.resultsCreated}</strong> results created
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Check the leaderboards to see the new data!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  <strong>Error:</strong> {result.error || "Unknown error"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
