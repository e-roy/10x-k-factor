"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Users, BarChart, Trophy, Home } from "lucide-react";

interface SearchResult {
  type: "cohort" | "result" | "subject" | "nav";
  id?: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!open || query.length < 1) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search cohorts
        try {
          const cohortsRes = await fetch(
            `/api/search/cohorts?q=${encodeURIComponent(query)}`
          );
          if (cohortsRes.ok) {
            const cohortsData = await cohortsRes.json();
            if (cohortsData.cohorts) {
              cohortsData.cohorts.forEach((cohort: { id: string; name: string; subject?: string }) => {
                searchResults.push({
                  type: "cohort",
                  id: cohort.id,
                  title: cohort.name,
                  subtitle: cohort.subject ? `Subject: ${cohort.subject}` : undefined,
                  href: `/cohort/${cohort.id}`,
                });
              });
            }
          }
        } catch (error) {
          console.error("[CommandPalette] Error searching cohorts:", error);
        }

        // Search results
        try {
          const resultsRes = await fetch(
            `/api/search/results?q=${encodeURIComponent(query)}`
          );
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            if (resultsData.results) {
              resultsData.results.forEach((result: { id: string; subject?: string; score?: number; createdAt: string }) => {
                searchResults.push({
                  type: "result",
                  id: result.id,
                  title: result.subject || "Practice",
                  subtitle: result.score !== null ? `Score: ${result.score}%` : undefined,
                  href: `/results/${result.id}`,
                });
              });
            }
          }
        } catch (error) {
          console.error("[CommandPalette] Error searching results:", error);
        }

        // Search subjects (for leaderboards)
        try {
          const subjectsRes = await fetch(
            `/api/search/subjects?q=${encodeURIComponent(query)}`
          );
          if (subjectsRes.ok) {
            const subjectsData = await subjectsRes.json();
            if (subjectsData.subjects) {
              subjectsData.subjects.forEach((subject: string) => {
                searchResults.push({
                  type: "subject",
                  title: subject.charAt(0).toUpperCase() + subject.slice(1),
                  subtitle: "Leaderboard",
                  href: `/app/leaderboard/${encodeURIComponent(subject)}`,
                });
              });
            }
          }
        } catch (error) {
          console.error("[CommandPalette] Error searching subjects:", error);
        }

        // Add navigation items if query matches
        const navItems: SearchResult[] = [
          { type: "nav", title: "Dashboard", href: "/app", subtitle: "Go to dashboard" },
          { type: "nav", title: "Cohorts", href: "/app/cohorts", subtitle: "View all cohorts" },
          { type: "nav", title: "Results", href: "/app/results", subtitle: "View all results" },
          { type: "nav", title: "Leaderboards", href: "/app/leaderboard", subtitle: "View leaderboards" },
          { type: "nav", title: "Rewards", href: "/app/rewards", subtitle: "View rewards" },
        ];

        navItems.forEach((item) => {
          if (
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase())
          ) {
            searchResults.push(item);
          }
        });

        setResults(searchResults);
      } catch (error) {
        console.error("[CommandPalette] Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, open]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "cohort":
        return <Users className="h-4 w-4" />;
      case "result":
        return <BarChart className="h-4 w-4" />;
      case "subject":
        return <Trophy className="h-4 w-4" />;
      case "nav":
        return <Home className="h-4 w-4" />;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search cohorts, results, subjects..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        {!loading && results.length === 0 && query.length > 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {!loading && query.length === 0 && (
          <CommandEmpty>Type to search...</CommandEmpty>
        )}
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result, index) => (
              <CommandItem
                key={`${result.type}-${result.id || result.title}-${index}`}
                onSelect={() => handleSelect(result.href)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {getIcon(result.type)}
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

