"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { ChallengeModal } from "@/components/modals/ChallengeModal";

interface ModalContextType {
  openModal: (modalType: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown>>({});

  const openModal = (modalType: string, data?: Record<string, unknown>) => {
    setCurrentModal(modalType);
    setModalData(data || {});
  };

  const closeModal = () => {
    setCurrentModal(null);
    setModalData({});
  };

  const handleChallengeComplete = (challengeId: string, score: number) => {
    console.log(`Challenge ${challengeId} completed with score: ${score}`);
    
    // Dispatch custom event to remove the bubble
    window.dispatchEvent(
      new CustomEvent("challengeCompleted", {
        detail: { challengeId, score },
      })
    );
    
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {/* Render modals based on currentModal */}
      <ChallengeModal
        isOpen={currentModal === "ChallengeModal"}
        onClose={closeModal}
        challengeId={modalData.challengeId as string | undefined}
        onComplete={handleChallengeComplete}
      />
      
      {/* Add more modals here as needed */}
    </ModalContext.Provider>
  );
}

