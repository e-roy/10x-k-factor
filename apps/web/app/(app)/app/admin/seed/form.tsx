"use client";

import { useState, useEffect, useCallback } from "react";
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
import { CheckCircle2, XCircle, Loader2, Zap, Users, UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  persona: string | null;
}

export function SeedForm() {
  const [quickLoading, setQuickLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [addDataLoading, setAddDataLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  
  // Users for "Add Data to Existing Users" section
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Form data for "Create New Users"
  const [createFormData, setCreateFormData] = useState({
    userCount: 5,
    resultsPerUser: 3,
    subjects: "algebra,geometry,calculus",
    scoreMin: 60,
    scoreMax: 100,
    createParents: false,
    createCohorts: false,
    createSubjectEnrollments: false,
    createXpEvents: false,
    createReferrals: false,
    cohortsPerSubject: 2,
    xpEventsPerUser: 5,
    referralCount: 3,
  });

  // Form data for "Add Data to Existing Users"
  const [addDataFormData, setAddDataFormData] = useState({
    createParents: false,
    createCohorts: false,
    createSubjectEnrollments: false,
    createXpEvents: false,
    createReferrals: false,
    cohortsPerSubject: 2,
    xpEventsPerUser: 5,
    referralCount: 3,
  });

  // Fetch users on mount for "Add Data to Existing Users"
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleCreateNewUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    setResult(null);

    try {
      const result = await seedUsersAndResults({
        userCount: createFormData.userCount,
        resultsPerUser: createFormData.resultsPerUser,
        subjects: createFormData.subjects,
        scoreMin: createFormData.scoreMin,
        scoreMax: createFormData.scoreMax,
        selectedUserIds: undefined,
        createParents: createFormData.createParents,
        createCohorts: createFormData.createCohorts,
        createSubjectEnrollments: createFormData.createSubjectEnrollments,
        createXpEvents: createFormData.createXpEvents,
        createReferrals: createFormData.createReferrals,
        cohortsPerSubject: createFormData.cohortsPerSubject,
        xpEventsPerUser: createFormData.xpEventsPerUser,
        referralCount: createFormData.referralCount,
      });
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddToExistingUsers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (selectedUserIds.size === 0) {
      setResult({
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        error: "Please select at least one user to add data to.",
      });
      return;
    }

    setAddDataLoading(true);
    setResult(null);

    try {
      const result = await seedUsersAndResults({
        userCount: 0,
        resultsPerUser: 0,
        subjects: "algebra,geometry,calculus", // Required but not used
        scoreMin: 0,
        scoreMax: 100,
        selectedUserIds: Array.from(selectedUserIds),
        createParents: addDataFormData.createParents,
        createCohorts: addDataFormData.createCohorts,
        createSubjectEnrollments: addDataFormData.createSubjectEnrollments,
        createXpEvents: addDataFormData.createXpEvents,
        createReferrals: addDataFormData.createReferrals,
        cohortsPerSubject: addDataFormData.cohortsPerSubject,
        xpEventsPerUser: addDataFormData.xpEventsPerUser,
        referralCount: addDataFormData.referralCount,
      });
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        usersCreated: 0,
        resultsCreated: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setAddDataLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const studentUsers = users.filter((u) => u.persona === "student" || !u.persona);

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
            performers, average users, and beginners. Includes all advanced
            options enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleQuickSeed}
            disabled={quickLoading || createLoading || addDataLoading}
            variant="outline"
          >
            {quickLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Seeding...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Quick Seed
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Create New Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Users
          </CardTitle>
          <CardDescription>
            Create new users with test results and optional advanced data
            (parents, cohorts, enrollments, XP events, referrals).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateNewUsers} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userCount">Number of Users</Label>
                <Input
                  id="userCount"
                  type="number"
                  min="1"
                  max="50"
                  value={createFormData.userCount}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
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
                  value={createFormData.resultsPerUser}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
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
                value={createFormData.subjects}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, subjects: e.target.value })
                }
                placeholder="algebra,geometry,calculus"
                required
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple subjects with commas
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
                  value={createFormData.scoreMin}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
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
                  value={createFormData.scoreMax}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      scoreMax: parseInt(e.target.value) || 100,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Additional Data (Optional)</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createParents"
                    checked={createFormData.createParents}
                    onCheckedChange={(checked) =>
                      setCreateFormData({
                        ...createFormData,
                        createParents: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="createParents"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Create parents (1-2 students per parent)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createCohorts"
                    checked={createFormData.createCohorts}
                    onCheckedChange={(checked) =>
                      setCreateFormData({
                        ...createFormData,
                        createCohorts: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="createCohorts"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create cohorts
                  </Label>
                  {createFormData.createCohorts && (
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={createFormData.cohortsPerSubject}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          cohortsPerSubject: parseInt(e.target.value) || 2,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {createFormData.createCohorts && (
                    <span className="text-xs text-muted-foreground">per subject</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createSubjectEnrollments"
                    checked={createFormData.createSubjectEnrollments}
                    onCheckedChange={(checked) =>
                      setCreateFormData({
                        ...createFormData,
                        createSubjectEnrollments: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="createSubjectEnrollments"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Create subject enrollments
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createXpEvents"
                    checked={createFormData.createXpEvents}
                    onCheckedChange={(checked) =>
                      setCreateFormData({
                        ...createFormData,
                        createXpEvents: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="createXpEvents"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create XP events
                  </Label>
                  {createFormData.createXpEvents && (
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={createFormData.xpEventsPerUser}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          xpEventsPerUser: parseInt(e.target.value) || 5,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {createFormData.createXpEvents && (
                    <span className="text-xs text-muted-foreground">per user</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createReferrals"
                    checked={createFormData.createReferrals}
                    onCheckedChange={(checked) =>
                      setCreateFormData({
                        ...createFormData,
                        createReferrals: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="createReferrals"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create referrals
                  </Label>
                  {createFormData.createReferrals && (
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={createFormData.referralCount}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          referralCount: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {createFormData.createReferrals && (
                    <span className="text-xs text-muted-foreground">total</span>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={createLoading || quickLoading || addDataLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Users
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Add Data to Existing Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Data to Existing Users
          </CardTitle>
          <CardDescription>
            Add seed data (parents, cohorts, enrollments, XP events, referrals)
            to users that already exist in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddToExistingUsers} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Users</Label>
              {loadingUsers ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
              ) : studentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No student users found in database.
                </p>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                    {studentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <Label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {user.name || user.email || user.id}
                          {user.persona && (
                            <span className="text-muted-foreground ml-2">
                              ({user.persona})
                            </span>
                          )}
                          {user.email && user.name && (
                            <span className="text-muted-foreground ml-2">
                              - {user.email}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedUserIds.size > 0
                      ? `${selectedUserIds.size} user(s) selected`
                      : "Select at least one user"}
                  </p>
                </>
              )}
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Data to Add</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addData-createParents"
                    checked={addDataFormData.createParents}
                    onCheckedChange={(checked) =>
                      setAddDataFormData({
                        ...addDataFormData,
                        createParents: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="addData-createParents"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Create parents (1-2 students per parent)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addData-createCohorts"
                    checked={addDataFormData.createCohorts}
                    onCheckedChange={(checked) =>
                      setAddDataFormData({
                        ...addDataFormData,
                        createCohorts: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="addData-createCohorts"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create cohorts
                  </Label>
                  {addDataFormData.createCohorts && (
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={addDataFormData.cohortsPerSubject}
                      onChange={(e) =>
                        setAddDataFormData({
                          ...addDataFormData,
                          cohortsPerSubject: parseInt(e.target.value) || 2,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {addDataFormData.createCohorts && (
                    <span className="text-xs text-muted-foreground">per subject</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addData-createSubjectEnrollments"
                    checked={addDataFormData.createSubjectEnrollments}
                    onCheckedChange={(checked) =>
                      setAddDataFormData({
                        ...addDataFormData,
                        createSubjectEnrollments: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="addData-createSubjectEnrollments"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Create subject enrollments
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addData-createXpEvents"
                    checked={addDataFormData.createXpEvents}
                    onCheckedChange={(checked) =>
                      setAddDataFormData({
                        ...addDataFormData,
                        createXpEvents: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="addData-createXpEvents"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create XP events
                  </Label>
                  {addDataFormData.createXpEvents && (
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={addDataFormData.xpEventsPerUser}
                      onChange={(e) =>
                        setAddDataFormData({
                          ...addDataFormData,
                          xpEventsPerUser: parseInt(e.target.value) || 5,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {addDataFormData.createXpEvents && (
                    <span className="text-xs text-muted-foreground">per user</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addData-createReferrals"
                    checked={addDataFormData.createReferrals}
                    onCheckedChange={(checked) =>
                      setAddDataFormData({
                        ...addDataFormData,
                        createReferrals: checked === true,
                      })
                    }
                  />
                  <Label
                    htmlFor="addData-createReferrals"
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    Create referrals
                  </Label>
                  {addDataFormData.createReferrals && (
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={addDataFormData.referralCount}
                      onChange={(e) =>
                        setAddDataFormData({
                          ...addDataFormData,
                          referralCount: parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {addDataFormData.createReferrals && (
                    <span className="text-xs text-muted-foreground">total</span>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={addDataLoading || quickLoading || createLoading || selectedUserIds.size === 0}
            >
              {addDataLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Data...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Add Data to Selected Users
                </>
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
                {result.usersCreated > 0 && (
                  <p className="text-sm">
                    <strong>{result.usersCreated}</strong> users created
                  </p>
                )}
                {result.resultsCreated > 0 && (
                  <p className="text-sm">
                    <strong>{result.resultsCreated}</strong> results created
                  </p>
                )}
                {result.existingUsersUsed !== undefined &&
                  result.existingUsersUsed > 0 && (
                    <p className="text-sm">
                      <strong>{result.existingUsersUsed}</strong> existing users
                      used
                    </p>
                  )}
                {result.parentsCreated !== undefined &&
                  result.parentsCreated > 0 && (
                    <p className="text-sm">
                      <strong>{result.parentsCreated}</strong> parents created
                    </p>
                  )}
                {result.cohortsCreated !== undefined &&
                  result.cohortsCreated > 0 && (
                    <p className="text-sm">
                      <strong>{result.cohortsCreated}</strong> cohorts created
                    </p>
                  )}
                {result.enrollmentsCreated !== undefined &&
                  result.enrollmentsCreated > 0 && (
                    <p className="text-sm">
                      <strong>{result.enrollmentsCreated}</strong> enrollments
                      created
                    </p>
                  )}
                {result.xpEventsCreated !== undefined &&
                  result.xpEventsCreated > 0 && (
                    <p className="text-sm">
                      <strong>{result.xpEventsCreated}</strong> XP events
                      created
                    </p>
                  )}
                {result.referralsCreated !== undefined &&
                  result.referralsCreated > 0 && (
                    <p className="text-sm">
                      <strong>{result.referralsCreated}</strong> referrals
                      created
                    </p>
                  )}
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
