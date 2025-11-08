import { getKByLoop, getReferralMetrics, getRecentReferrals } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsForm } from "./form";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const from = params.from || thirtyDaysAgo.toISOString().split("T")[0];
  const to = params.to || today.toISOString().split("T")[0];

  let metrics: Awaited<ReturnType<typeof getKByLoop>> = [];
  let referralMetrics: Awaited<ReturnType<typeof getReferralMetrics>> = [];
  let recentReferrals: Awaited<ReturnType<typeof getRecentReferrals>> = [];
  let error: string | null = null;

  try {
    metrics = await getKByLoop(from, to);
    referralMetrics = await getReferralMetrics(from, to);
    recentReferrals = await getRecentReferrals(from, to, 20);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load metrics";
    console.error("[metrics] Error loading data:", err);
  }

  // Calculate summary stats
  const totalReferrals = referralMetrics.reduce((sum, m) => sum + m.total_referrals, 0);
  const totalCompleted = referralMetrics.reduce((sum, m) => sum + m.completed_actions, 0);
  const overallCompletionRate = totalReferrals > 0 
    ? ((totalCompleted / totalReferrals) * 100).toFixed(1) 
    : "0";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">K-Factor &amp; Referral Metrics</h1>
        <p className="text-muted-foreground">
          Viral growth metrics by loop and date
        </p>
      </div>

      <MetricsForm from={from} to={to} />

      {/* Summary Stats */}
      {!error && totalReferrals > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalCompleted}</div>
              <p className="text-sm text-muted-foreground">Completed Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{overallCompletionRate}%</div>
              <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive">
              <p>Error: {error}</p>
              <p className="text-sm mt-2">
                Make sure the materialized view migration has been run.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* K-Factor Metrics */}
          {metrics.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No K-factor data found for the selected date range. Events may not have been
                  ingested yet, or the materialized view needs to be refreshed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>K-Factor by Loop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Loop</th>
                        <th className="text-right p-2">Invites/User</th>
                        <th className="text-right p-2">Invite→FVM Rate</th>
                        <th className="text-right p-2 font-bold">K-Factor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            {new Date(row.d).toLocaleDateString()}
                          </td>
                          <td className="p-2 font-mono text-sm">{row.loop}</td>
                          <td className="p-2 text-right">
                            {row.invites_per_user?.toFixed(2) ?? "—"}
                          </td>
                          <td className="p-2 text-right">
                            {row.invite_to_fvm_rate
                              ? `${(row.invite_to_fvm_rate * 100).toFixed(1)}%`
                              : "—"}
                          </td>
                          <td className="p-2 text-right font-bold">
                            {row.k_est?.toFixed(3) ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral Metrics by Loop */}
          {referralMetrics.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  No referral data found for the selected date range.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Referral Metrics by Loop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Loop</th>
                        <th className="text-right p-2">Total Referrals</th>
                        <th className="text-right p-2">Completed</th>
                        <th className="text-right p-2">Completion Rate</th>
                        <th className="text-right p-2">Inviter Rewarded</th>
                        <th className="text-right p-2">Invitee Rewarded</th>
                        <th className="text-right p-2">Avg Conv. Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralMetrics.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{row.loop}</td>
                          <td className="p-2 text-right font-bold">
                            {row.total_referrals}
                          </td>
                          <td className="p-2 text-right">
                            {row.completed_actions}
                          </td>
                          <td className="p-2 text-right">
                            <span className={
                              row.completion_rate >= 70 
                                ? "text-green-600 font-semibold" 
                                : row.completion_rate >= 40 
                                ? "text-yellow-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }>
                              {row.completion_rate}%
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            {row.inviter_rewarded}
                          </td>
                          <td className="p-2 text-right">
                            {row.invitee_rewarded}
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            {row.avg_conversion_time_hours 
                              ? `${row.avg_conversion_time_hours}h`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Referrals */}
          {recentReferrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Inviter</th>
                        <th className="text-left p-2">Invitee</th>
                        <th className="text-left p-2">Loop</th>
                        <th className="text-center p-2">Completed</th>
                        <th className="text-center p-2">Rewards</th>
                        <th className="text-right p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReferrals.map((referral, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">
                            {referral.inviter_email || "—"}
                          </td>
                          <td className="p-2 text-sm">
                            {referral.invitee_email || "—"}
                          </td>
                          <td className="p-2 font-mono text-xs">
                            {referral.loop}
                          </td>
                          <td className="p-2 text-center">
                            {referral.completed_action ? (
                              <CheckCircle2 className="inline h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="inline h-4 w-4 text-yellow-600" />
                            )}
                          </td>
                          <td className="p-2 text-center text-xs">
                            <div className="flex items-center justify-center gap-1">
                              {referral.inviter_rewarded ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-gray-400" />
                              )}
                              /
                              {referral.invitee_rewarded ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
