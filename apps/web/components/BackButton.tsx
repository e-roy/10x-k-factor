"use client";

import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      }}
    >
      Go Back
    </Button>
  );
}

