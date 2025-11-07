import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Page() {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // If session is invalid (corrupted cookie or wrong secret), treat as not logged in
    // This allows the user to re-authenticate
    session = null;
  }

  // If logged in, redirect to /app
  if (session) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold">10x K Factor</h1>
        <p className="text-muted-foreground">PWA-first viral growth system</p>
        <div className="pt-4">
          <LoginButton next="/app" />
        </div>
      </div>
    </div>
  );
}
