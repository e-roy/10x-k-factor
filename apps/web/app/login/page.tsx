import type { Metadata } from "next";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { parseAttribCookie } from "@/lib/smart-links/attrib";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // If session is invalid, treat as not logged in
    session = null;
  }

  const params = await searchParams;
  
  // If already logged in, determine redirect destination
  if (session) {
    // Priority: next param > attribution cookie > default /app
    if (params.next) {
      redirect(params.next);
    }
    
    // Check for attribution cookie
    const cookieStore = await cookies();
    const attribCookie = cookieStore.get("vt_attrib");
    const attribution = parseAttribCookie(attribCookie?.value);
    
    if (attribution) {
      redirect("/session/complete");
    }
    
    // Default to dashboard
    redirect("/app");
  }

  // Determine redirect URL for login button
  let nextUrl = "/app";
  if (params.next) {
    nextUrl = params.next;
  } else {
    // Check for attribution cookie to redirect to session/complete after login
    const cookieStore = await cookies();
    const attribCookie = cookieStore.get("vt_attrib");
    const attribution = parseAttribCookie(attribCookie?.value);
    
    if (attribution) {
      nextUrl = "/session/complete";
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          Sign in to continue to 10x K Factor
        </p>
        <div className="pt-4">
          <LoginButton next={nextUrl} />
        </div>
      </div>
    </div>
  );
}
