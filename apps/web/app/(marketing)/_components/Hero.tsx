"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { hero } from "../_data/copy";

export function Hero() {
  return (
    <ScrollReveal className="py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {hero.eyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {hero.headline}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl lg:leading-9">
              {hero.subheadline}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                variant="default"
                className="min-w-[160px]"
              >
                <Link href="/login">{hero.primaryCta}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[160px]"
              >
                <Link href="/login">{hero.secondaryCta}</Link>
              </Button>
            </div>
            <p className="mt-8 text-sm font-medium text-muted-foreground">
              {hero.microProof}
            </p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
              {hero.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src="/images/hero.png"
              alt="Students and tutors celebrating learning achievements together"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
