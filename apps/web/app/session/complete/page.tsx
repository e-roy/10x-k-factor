import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { smartLinks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseAttribCookie } from "@/lib/smart-links/attrib";

export default async function SessionCompletePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Read attribution cookie
  const cookieStore = await cookies();
  const attribCookie = cookieStore.get("vt_attrib");
  const attribution = parseAttribCookie(attribCookie?.value);

  // If no attribution, redirect to dashboard
  if (!attribution) {
    redirect("/app");
  }

  // Look up smart link to get params
  const [link] = await db
    .select({
      params: smartLinks.params,
    })
    .from(smartLinks)
    .where(eq(smartLinks.code, attribution.smart_link_code))
    .limit(1);

  // If link not found or no params, redirect to dashboard
  if (!link || !link.params) {
    redirect("/app");
  }

  const params = link.params as Record<string, unknown>;

  // Route based on params priority: resultId > deckId > cohortId
  if (params.resultId && typeof params.resultId === "string") {
    redirect(`/results/${params.resultId}`);
  }

  if (params.deckId && typeof params.deckId === "string") {
    redirect(`/fvm/skill/${params.deckId}`);
  }

  if (params.cohortId && typeof params.cohortId === "string") {
    redirect(`/cohort/${params.cohortId}`);
  }

  // Default fallback to dashboard
  redirect("/app");
}

