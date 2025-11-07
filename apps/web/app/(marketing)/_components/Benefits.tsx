"use client";

import { TrendingUp, Users, Share2, Gift } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { benefits } from "../_data/copy";

const benefitIcons = [TrendingUp, Users, Share2, Gift];

export function Benefits() {
  return (
    <ScrollReveal className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {benefits.headline}
        </h2>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.items.map((item, index) => {
          const Icon = benefitIcons[index] || TrendingUp;
          return (
            <ScrollReveal key={index}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {item.body}
                  </CardDescription>
                </CardContent>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
