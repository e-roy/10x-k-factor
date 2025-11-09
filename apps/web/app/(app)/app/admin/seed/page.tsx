import { SeedForm } from "./form";

export default async function SeedPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Seed Data for Leaderboards</h1>
        <p className="text-muted-foreground">
          Create test users and results data to populate leaderboards for
          testing and demos.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Users will be created with names like &quot;Test User 1&quot;,
          &quot;Test User 2&quot;, etc. Results will be distributed across the
          specified subjects with random scores within the selected range.
        </p>
      </div>

      <SeedForm />
    </div>
  );
}
