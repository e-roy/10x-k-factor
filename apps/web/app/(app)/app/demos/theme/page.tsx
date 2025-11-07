import { PersonaThemeDemo } from "@/components/PersonaThemeDemo";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ThemeDemoPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div>
      <PersonaThemeDemo />
    </div>
  );
}

