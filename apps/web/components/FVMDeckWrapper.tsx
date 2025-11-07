"use client";

import { FVMCompletionHandler } from "@/components/FVMCompletionHandler";
import { MicroDeck } from "@/components/MicroDeck";
import type { Deck } from "@/lib/decks";

interface FVMDeckWrapperProps {
  deck: Deck;
  deckSubject?: string | null;
  attribution?: {
    inviter_id: string;
    loop: string;
    smart_link_code: string;
  };
}

/**
 * Client component wrapper that combines FVMCompletionHandler and MicroDeck
 * This allows the render prop pattern to work within the client boundary
 */
export function FVMDeckWrapper({
  deck,
  deckSubject,
  attribution,
}: FVMDeckWrapperProps) {
  return (
    <FVMCompletionHandler deckId={deck.id} deckSubject={deckSubject}>
      {(onComplete) => (
        <MicroDeck
          deck={deck}
          attribution={attribution}
          onComplete={onComplete}
        />
      )}
    </FVMCompletionHandler>
  );
}
