import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function ChallengeNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Challenge Not Found</h1>
            <p className="text-muted-foreground">
              This challenge doesn&apos;t exist or may have been deleted.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/app">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

