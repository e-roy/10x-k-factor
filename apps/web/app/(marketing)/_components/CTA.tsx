"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { cta } from "../_data/copy";

export function CTA() {
  return (
    <ScrollReveal className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {cta.headline}
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
          {cta.sub}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" variant="default" className="min-w-[160px]">
            <Link href="/signup">{cta.primaryCta}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[160px]">
            <Link href="/signup">{cta.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );
}
