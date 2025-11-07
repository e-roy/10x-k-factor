import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardsLedger } from "@/components/RewardsLedger";
import { RewardsBalances } from "@/components/RewardsBalances";
import { Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Rewards",
};

export default async function RewardsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Will be redirected by layout
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground mt-1">
            Your rewards and transaction history
          </p>
        </div>

        {/* Reward Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Rewards
            </CardTitle>
            <CardDescription>
              Current balances for all reward types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RewardsBalances />
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All your reward grants and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RewardsLedger />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

