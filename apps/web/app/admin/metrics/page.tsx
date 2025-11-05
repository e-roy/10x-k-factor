import { getKByLoop } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsForm } from "./form";

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
  let error: string | null = null;

  try {
    metrics = await getKByLoop(from, to);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load metrics";
    console.error("[metrics] Error loading data:", err);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">K-Factor Metrics</h1>
        <p className="text-muted-foreground">
          Viral growth metrics by loop and date
        </p>
      </div>

      <MetricsForm from={from} to={to} />

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
      ) : metrics.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No data found for the selected date range. Events may not have been
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
    </div>
  );
}

