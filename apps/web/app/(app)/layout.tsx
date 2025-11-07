import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteJoinedTracker } from "@/components/InviteJoinedTracker";
import { SidebarNav } from "@/components/app-layout/SidebarNav";
import { CommandPalette } from "@/components/app-layout/CommandPalette";
import { InviteButton } from "@/components/InviteButton";
import { HeaderContent } from "@/components/app-layout/HeaderContent";
import { CohortProvider } from "@/components/app-layout/CohortContext";
import { PersonaProvider } from "@/components/PersonaProvider";
import type { Persona } from "@/lib/persona-utils";

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

  // Check if user has admin role
  const showAdmin = session.user.role === "admin";
  const persona = (session.user.persona || "student") as Persona;

  // Fetch user's custom colors
  const { db } = await import("@/db/index");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <PersonaProvider 
      persona={persona}
      primaryColor={user?.primaryColor}
      secondaryColor={user?.secondaryColor}
    >
      <CohortProvider>
        <InviteJoinedTracker />
        <CommandPalette />
        <div className="grid grid-cols-[260px_1fr] min-h-screen">
          <aside className="border-r bg-background p-4 flex flex-col">
            <Link href="/app" className="font-semibold text-lg block mb-6">
              K-Factor
            </Link>
            <SidebarNav showAdmin={showAdmin} />
            <div className="mt-auto pt-4">
              <InviteButton
                userId={session.user.id}
                persona={persona}
                variant="default"
                size="sm"
                className="w-full"
              />
            </div>
          </aside>
          <div className="flex flex-col">
            <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
              <HeaderContent
                userId={session.user.id}
                userName={session.user.name}
                userEmail={session.user.email}
                userImage={session.user.image}
                persona={persona}
              />
            </header>
            <main className="flex-1 overflow-auto p-4">{children}</main>
          </div>
        </div>
      </CohortProvider>
    </PersonaProvider>
  );
}
