"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart,
  Trophy,
  Gift,
  Settings,
  TrendingUp,
  Database,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/results", label: "Results", icon: BarChart },
  { href: "/app/leaderboard", label: "Leaderboards", icon: Trophy },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/demos", label: "TEST: Demos", icon: Search },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/app/admin/metrics", label: "Metrics", icon: TrendingUp },
  { href: "/app/admin/seed", label: "Seed Data", icon: Database },
];

interface SidebarNavProps {
  showAdmin?: boolean;
}

export function SidebarNav({ showAdmin = false }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    // For nested routes, check if pathname starts with the href
    // Special handling for /app/admin/results/new to not match /app/admin/results
    if (href === "/app/admin/results/new") {
      return pathname === "/app/admin/results/new";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              isActive(item.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {showAdmin && (
        <>
          <Separator className="my-2" />
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin
          </div>
          {ADMIN_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
