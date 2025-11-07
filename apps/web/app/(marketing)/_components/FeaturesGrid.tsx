"use client";

import { Share2, Link2, Users, Gift, FlaskConical, Shield } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { features } from "../_data/copy";

const featureIcons = [Share2, Link2, Users, Gift, FlaskConical, Shield];

export function FeaturesGrid() {
  return (
    <ScrollReveal
      id={features.id}
      className="scroll-mt-16 py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl">
            {features.headline}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 text-center sm:mt-16 sm:grid-cols-2 sm:gap-x-12 gap-y-12 md:grid-cols-3 md:gap-0 xl:mt-24">
          {features.items.map((item, index) => {
            const Icon = featureIcons[index] || Share2;

            // Border logic: first row items 1-2 get left border, second row all get top border, second row items 1-2 also get left border
            const borderClasses = [
              "", // index 0: no borders
              "md:border-l border-border", // index 1: left border
              "md:border-l border-border", // index 2: left border
              "md:border-t border-border", // index 3: top border
              "md:border-l md:border-t border-border", // index 4: left + top
              "md:border-l md:border-t border-border", // index 5: left + top
            ];

            return (
              <ScrollReveal key={index}>
                <div className={`md:p-8 lg:p-14 ${borderClasses[index] || ""}`}>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center text-foreground">
                    <Icon className="h-12 w-12" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-12 text-xl font-bold">{item.title}</h3>
                  <p className="mt-5 text-base text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
