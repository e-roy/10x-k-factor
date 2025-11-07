"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface LedgerEntry {
  id: number;
  rewardId: string | null;
  userId: string;
  type: "reward_grant" | "reward_denied";
  unitCostCents: number;
  quantity: number;
  totalCostCents: number;
  loop: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
}

interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export function RewardsLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterType, setFilterType] = useState<"reward_grant" | "reward_denied" | "all">("all");

  const fetchEntries = async (offset = 0, type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: offset.toString(),
      });
      if (type && type !== "all") {
        params.append("type", type);
      }

      const response = await fetch(`/api/rewards/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (offset === 0) {
            setEntries(data.entries);
          } else {
            setEntries((prev) => [...prev, ...data.entries]);
          }
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error("[RewardsLedger] Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(0, filterType === "all" ? undefined : filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchEntries(entries.length, filterType === "all" ? undefined : filterType);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getTypeDescription = (entry: LedgerEntry) => {
    if (entry.type === "reward_grant") {
      // Try to get reward type from metadata, or infer from quantity/context
      const metadata = entry.metadata || {};
      const rewardType = metadata.reward_type as string | undefined;
      const amount = entry.quantity;
      
      if (rewardType === "ai_minutes" || (amount === 15 && !rewardType)) {
        return `+${amount} AI minutes`;
      } else if (rewardType === "streak_shield") {
        return `+${amount} Streak Shield${amount !== 1 ? "s" : ""}`;
      } else if (rewardType === "credits") {
        return `+${amount} Credits`;
      }
      return `Reward granted (${amount} units)`;
    }
    return "Reward denied";
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No ledger entries yet. Complete challenges to earn rewards!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All
        </Button>
        <Button
          variant={filterType === "reward_grant" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("reward_grant")}
        >
          Granted
        </Button>
        <Button
          variant={filterType === "reward_denied" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("reward_denied")}
        >
          Denied
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">
                  {formatDate(entry.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.type === "reward_grant" ? "default" : "destructive"
                    }
                  >
                    {entry.type === "reward_grant" ? "Grant" : "Denied"}
                  </Badge>
                </TableCell>
                <TableCell>{getTypeDescription(entry)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(entry.unitCostCents)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(entry.totalCostCents)}
                </TableCell>
                <TableCell>
                  {entry.loop && (
                    <Badge variant="outline" className="text-xs">
                      {entry.loop}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {pagination && pagination.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

