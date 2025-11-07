"use client";

import { Link2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Handle hash navigation on mount
    if (typeof window !== "undefined" && window.location.hash === `#${id}`) {
      const element = headingRef.current;
      if (element) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        element.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        // Focus for accessibility
        setTimeout(() => {
          element.focus();
        }, 100);
      }
    }
  }, [id]);

  return (
    <section id={id} className="scroll-mt-24">
      <h2
        ref={headingRef}
        className="group relative mb-4 mt-8 flex items-center gap-2 text-2xl font-semibold"
        tabIndex={-1}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>{title}</span>
        <Link
          href={`#${id}`}
          className={cn(
            "inline-flex items-center text-muted-foreground opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
            isHovered && "opacity-100"
          )}
          aria-label={`Link to ${title}`}
          onClick={(e) => {
            e.preventDefault();
            const element = headingRef.current;
            if (element) {
              const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches;
              window.history.pushState(null, "", `#${id}`);
              element.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start",
              });
              element.focus();
            }
          }}
        >
          <Link2 className="h-4 w-4" />
        </Link>
      </h2>
      <div className="prose prose-sm max-w-none text-foreground [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>li]:mb-2">
        {children}
      </div>
    </section>
  );
}
