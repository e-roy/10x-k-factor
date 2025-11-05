import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Results",
};

// Auth protection is handled by (app)/layout.tsx
// We still need to get session here for displaying user info
export default async function ResultsPage() {
  const session = await auth();

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Results</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || session?.user?.email}!
            </p>
          </div>
          <LogoutButton />
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Your results will appear here. This page is protected and requires
            authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
