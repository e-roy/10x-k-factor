import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getDeck } from "@/lib/decks";
import { MicroDeck } from "@/components/MicroDeck";

interface FVMPageProps {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * FVM Micro-Task Landing Page
 * 
 * This page displays a 5-question micro-deck that new users land on
 * after clicking a shared link. It tracks completion time and fires
 * analytics events.
 */
export default async function FVMPage({ params, searchParams }: FVMPageProps) {
  const { deckId } = await params;
  const queryParams = await searchParams;
  
  // Get deck data
  const deck = getDeck(deckId);
  if (!deck) {
    notFound();
  }

  // Get attribution from cookie (set by smart link resolver)
  // We need to construct a NextRequest to use getAttribution
  // Since we're in a server component, we'll use headers() and construct attribution manually
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  
  // Parse attribution cookie manually
  let attribution: {
    inviter_id: string;
    loop: string;
    smart_link_code: string;
  } | undefined;

  // Try to get from cookie
  const attribCookieMatch = cookieHeader.match(/vt_attrib=([^;]+)/);
  if (attribCookieMatch) {
    try {
      const decoded = decodeURIComponent(attribCookieMatch[1]);
      const parsed = JSON.parse(decoded);
      if (parsed.inviter_id && parsed.loop && parsed.smart_link_code) {
        attribution = {
          inviter_id: parsed.inviter_id,
          loop: parsed.loop,
          smart_link_code: parsed.smart_link_code,
        };
      }
    } catch (error) {
      console.warn("[fvm] Failed to parse attribution cookie:", error);
    }
  }

  // Fallback to query params if cookie not available
  if (!attribution) {
    const inviter = queryParams.inviter as string | undefined;
    const loop = queryParams.loop as string | undefined;
    const code = queryParams.code as string | undefined;
    
    if (inviter && loop && code) {
      attribution = {
        inviter_id: inviter,
        loop: loop,
        smart_link_code: code,
      };
    }
  }

  // Note: Completion handler is implemented in MicroDeck client component
  // which calls track() directly from client-side

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quick Practice</h1>
        <p className="text-muted-foreground">
          Complete 5 questions to unlock your reward
        </p>
      </div>
      
      <MicroDeck
        deck={deck}
        attribution={attribution}
      />
    </div>
  );
}

