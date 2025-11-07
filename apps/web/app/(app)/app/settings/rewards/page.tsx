import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RewardBadge } from "@/components/RewardBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RewardsLedger } from "@/components/RewardsLedger";

export default async function SettingsRewardsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rewards & Ledger</h1>
          <p className="text-muted-foreground">
            View your reward balances and transaction history
          </p>
        </div>

        {/* Current Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <RewardBadge />
          </CardContent>
        </Card>

        {/* Ledger */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <RewardsLedger />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

