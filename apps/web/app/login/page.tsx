import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // If session is invalid, treat as not logged in
    session = null;
  }

  // If already logged in, redirect to results
  if (session) {
    redirect("/results");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          Sign in to continue to 10x K Factor
        </p>
        <div className="pt-4">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
