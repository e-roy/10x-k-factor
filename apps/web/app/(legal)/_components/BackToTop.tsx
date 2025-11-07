"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  return (
    <div className="mt-8 flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }}
        className="text-xs text-muted-foreground"
      >
        <ArrowUp className="mr-1 h-3 w-3" />
        Back to top
      </Button>
    </div>
  );
}
