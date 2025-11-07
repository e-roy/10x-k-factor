"use client";

import { ScrollReveal } from "./ScrollReveal";
import { trust } from "../_data/copy";

export function TrustBar() {
  return (
    <ScrollReveal className="py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {trust.headline}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {trust.logos.map((logo, index) => (
            <div
              key={index}
              className="text-base font-semibold text-muted-foreground opacity-60"
            >
              {logo}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{trust.note}</p>
      </div>
    </ScrollReveal>
  );
}
