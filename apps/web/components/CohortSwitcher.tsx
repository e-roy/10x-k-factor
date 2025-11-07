"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCohort } from "@/components/app-layout/CohortContext";

interface Cohort {
  id: string;
  name: string;
  subject: string | null;
}

interface CohortSwitcherProps {
  userId: string;
}

export function CohortSwitcher({ userId }: CohortSwitcherProps) {
  const { selectedCohortId, setSelectedCohort } = useCohort();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCohorts() {
      try {
        const response = await fetch("/api/cohorts");
        if (response.ok) {
          const data = await response.json();
          setCohorts(data.cohorts || []);
          
          // Set first cohort as default if available and none selected
          if (data.cohorts && data.cohorts.length > 0 && !selectedCohortId) {
            const firstCohort = data.cohorts[0];
            setSelectedCohort(firstCohort.id, firstCohort.subject);
          }
        }
      } catch (error) {
        console.error("[CohortSwitcher] Failed to fetch cohorts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCohorts();
  }, [userId, selectedCohortId, setSelectedCohort]);

  const handleChange = (value: string) => {
    const cohort = cohorts.find((c) => c.id === value);
    if (cohort) {
      setSelectedCohort(cohort.id, cohort.subject);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (cohorts.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No cohorts yet
      </div>
    );
  }

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Cohort:</span>
      <Select value={selectedCohortId || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px] h-8 text-sm">
          <SelectValue>
            {selectedCohort ? (
              <span className="font-medium text-foreground">
                {selectedCohort.name}
              </span>
            ) : (
              "Select cohort"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {cohorts.map((cohort) => (
            <SelectItem key={cohort.id} value={cohort.id}>
              <div className="flex flex-col">
                <span>{cohort.name}</span>
                {cohort.subject && (
                  <span className="text-xs text-muted-foreground">
                    {cohort.subject}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

