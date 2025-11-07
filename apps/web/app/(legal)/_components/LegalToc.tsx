"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
}

interface LegalTocProps {
  items: TocItem[];
}

export function LegalToc({ items }: LegalTocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Handle initial hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.slice(1);
      setActiveId(hash);
    }

    // Set up IntersectionObserver for scrollspy
    const observerOptions = {
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
          // Update URL hash without scrolling
          if (entry.target.id) {
            window.history.replaceState(
              null,
              "",
              `${pathname}#${entry.target.id}`
            );
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items, pathname]);

  const handleLinkClick = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
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
  };

  const tocContent = (
    <nav aria-label="In-page navigation" className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick(item.id);
          }}
          className={cn(
            "block rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            activeId === item.id
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        {tocContent}
      </aside>

      {/* Mobile: Sheet drawer */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open table of contents</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Table of Contents</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{tocContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
