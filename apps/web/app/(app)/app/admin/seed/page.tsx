import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SeedPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Seed Data</h1>
        <p className="text-muted-foreground">
          Manage and seed application data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seed Data Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seed data functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
