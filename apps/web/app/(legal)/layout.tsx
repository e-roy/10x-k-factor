import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalHeader } from "./_components/LegalHeader";
import { LegalFooter } from "./_components/LegalFooter";

export const metadata: Metadata = {
  title: "Legal — 10x K Factor",
  description: "Terms of Service and Privacy Policy for 10x K Factor",
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <LegalHeader />
      {children}
      <LegalFooter />
    </div>
  );
}
