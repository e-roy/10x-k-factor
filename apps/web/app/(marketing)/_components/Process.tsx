"use client";

import { ScrollReveal } from "./ScrollReveal";
import { process } from "../_data/copy";

export function Process() {
  return (
    <ScrollReveal
      id={process.id}
      className="scroll-mt-16 py-10 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {process.headline}
          </h2>
        </div>

        <div className="relative mt-12 lg:mt-20">
          <div className="absolute inset-x-0 hidden xl:px-44 top-2 md:block md:px-20 lg:px-28">
            <svg
              className="w-full h-4"
              viewBox="0 0 1000 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0 10 Q250 0 500 10 T1000 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                className="text-border"
              />
            </svg>
          </div>

          <div className="relative grid grid-cols-1 text-center gap-y-12 md:grid-cols-3 gap-x-12">
            {process.steps.map((step, index) => (
              <ScrollReveal key={index}>
                <div>
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-background border-2 border-border rounded-full shadow">
                    <span className="text-xl font-semibold text-foreground">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-tight md:mt-10">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
