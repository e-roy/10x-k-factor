import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    // If session is invalid, redirect to login
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
