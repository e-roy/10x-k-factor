import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "10x K Factor - Viral Growth for Learning Apps",
  description:
    "Turn every result into a referral. Add share cards, smart links, presence, and rewards to your learning app.",
  openGraph: {
    title: "10x K Factor - Viral Growth for Learning Apps",
    description:
      "Turn every result into a referral. Add share cards, smart links, presence, and rewards to your learning app.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "10x K Factor - Viral Growth for Learning Apps",
    description:
      "Turn every result into a referral. Add share cards, smart links, presence, and rewards to your learning app.",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen scroll-smooth">{children}</div>;
}
