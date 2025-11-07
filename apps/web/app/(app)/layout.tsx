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

  return (
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
              persona={session.user.persona || "student"}
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
            />
          </header>
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </CohortProvider>
  );
}
