"use client";

import { ScrollReveal } from "./ScrollReveal";
import { dashboardMock } from "../_data/copy";

export function DashboardMock() {
  return (
    <ScrollReveal className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {dashboardMock.headline}
          </h2>
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            {dashboardMock.bullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src="/images/placeholder-dashboard.png"
              alt="Abstract visualization of growth and viral connections"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {dashboardMock.caption}
        </p>
      </div>
    </ScrollReveal>
  );
}
