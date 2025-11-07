"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CohortContextType {
  selectedCohortId: string | null;
  selectedCohortSubject: string | null;
  setSelectedCohort: (cohortId: string | null, subject: string | null) => void;
}

const CohortContext = createContext<CohortContextType | undefined>(undefined);

export function CohortProvider({ children }: { children: ReactNode }) {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [selectedCohortSubject, setSelectedCohortSubject] = useState<string | null>(null);

  const setSelectedCohort = (cohortId: string | null, subject: string | null) => {
    setSelectedCohortId(cohortId);
    setSelectedCohortSubject(subject);
  };

  return (
    <CohortContext.Provider
      value={{
        selectedCohortId,
        selectedCohortSubject,
        setSelectedCohort,
      }}
    >
      {children}
    </CohortContext.Provider>
  );
}

export function useCohort() {
  const context = useContext(CohortContext);
  if (context === undefined) {
    throw new Error("useCohort must be used within a CohortProvider");
  }
  return context;
}

