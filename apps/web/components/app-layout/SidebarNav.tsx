"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  BarChart,
  Trophy,
  Gift,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/cohorts", label: "Cohorts", icon: Users },
  { href: "/app/results", label: "Results", icon: BarChart },
  { href: "/app/leaderboard", label: "Leaderboards", icon: Trophy },
  { href: "/app/rewards", label: "Rewards", icon: Gift },
  { href: "/app/settings/profile", label: "Settings", icon: Settings },
];

interface SidebarNavProps {
  showAdmin?: boolean;
}

export function SidebarNav({ showAdmin = false }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    ...NAV_ITEMS,
    ...(showAdmin
      ? [{ href: "/app/admin/metrics", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="w-4 h-4" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

