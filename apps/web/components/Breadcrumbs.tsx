"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs component that automatically generates breadcrumbs from pathname
 * or uses provided items
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If items are provided, use them
  if (items && items.length > 0) {
    return (
      <nav
        className={`flex items-center gap-1 text-sm text-muted-foreground ${className || ""}`}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => (
          <Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        ))}
      </nav>
    );
  }

  // Auto-generate from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({ label: "Home", href: "/app" });

  // Build breadcrumbs from path segments
  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // Skip app segment (already have Home)
    if (segment === "app") {
      return;
    }

    // Format label
    let label = segment;
    if (segment === "results") label = "Results";
    else if (segment === "leaderboard") label = "Leaderboards";
    else if (segment === "rewards") label = "Rewards";
    else if (segment === "settings") label = "Settings";
    else if (segment === "admin") label = "Admin";
    else if (segment === "new") label = "New";
    else {
      // Capitalize first letter
      label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    breadcrumbs.push({ label, href: currentPath });
  });

  // Don't show breadcrumbs if we're just on /app
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center gap-1 text-sm text-muted-foreground ${className || ""}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

