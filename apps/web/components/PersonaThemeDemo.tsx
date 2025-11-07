"use client";

/**
 * PersonaThemeDemo - Component to showcase persona theme system
 * 
 * This component demonstrates all the available CSS utilities and how they
 * automatically adapt based on the current persona (student/parent/tutor).
 * 
 * Usage: Add this to any page to see the theme in action
 * <PersonaThemeDemo />
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PersonaThemeDemo() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Persona Theme System Demo</h1>
        <p className="text-muted-foreground">
          All components below automatically adapt to the current persona (student/parent/tutor)
        </p>
      </div>

      {/* Color Swatches */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Swatches</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-persona-primary" />
            <p className="text-sm font-medium">Primary</p>
            <code className="text-xs">bg-persona-primary</code>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-persona-secondary" />
            <p className="text-sm font-medium">Secondary</p>
            <code className="text-xs">bg-persona-secondary</code>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-persona-gradient" />
            <p className="text-sm font-medium">Gradient</p>
            <code className="text-xs">bg-persona-gradient</code>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg bg-persona-overlay border border-persona" />
            <p className="text-sm font-medium">Overlay</p>
            <code className="text-xs">bg-persona-overlay</code>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-lg border-4 border-persona" />
            <p className="text-sm font-medium">Border</p>
            <code className="text-xs">border-persona</code>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-persona px-6 py-3 rounded-lg font-medium">
            Persona Gradient Button
          </button>
          <button className="btn-persona-outline px-6 py-3 rounded-lg font-medium">
            Persona Outline Button
          </button>
          <Button className="bg-persona-gradient hover:opacity-90">
            shadcn Button + Persona
          </Button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><code>btn-persona</code> - Gradient background with hover effects</p>
          <p><code>btn-persona-outline</code> - Outline style with hover fill</p>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card className="card-persona">
            <CardHeader>
              <CardTitle>Persona Card</CardTitle>
              <CardDescription>Subtle gradient background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This card automatically gets persona colors with hover effects.
              </p>
            </CardContent>
          </Card>

          <Card className="border-persona-strong">
            <CardHeader>
              <CardTitle className="text-persona-primary">Strong Border</CardTitle>
              <CardDescription>With colored title</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Uses <code>border-persona-strong</code>
              </p>
            </CardContent>
          </Card>

          <Card className="glow-persona">
            <CardHeader>
              <CardTitle>Glow Effect</CardTitle>
              <CardDescription>Hover to see glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Uses <code>glow-persona</code> class
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge className="badge-persona">Persona Badge</Badge>
          <Badge className="bg-persona-gradient">Gradient Badge</Badge>
          <span className="badge-persona px-3 py-1 rounded-full text-sm font-medium">
            Custom Badge
          </span>
        </div>
      </section>

      {/* Text Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Text Colors</h2>
        <div className="space-y-2">
          <p className="text-persona-primary text-lg font-semibold">
            Primary Text Color
          </p>
          <p className="text-persona-secondary text-lg font-semibold">
            Secondary Text Color
          </p>
          <p className="text-persona-accent text-lg font-semibold">
            Accent Text Color
          </p>
        </div>
      </section>

      {/* Progress & Loading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Progress & Loading</h2>
        
        {/* Progress Bar */}
        <div>
          <p className="text-sm font-medium mb-2">Progress Bar</p>
          <div className="progress-persona-track w-full h-2 rounded-full overflow-hidden">
            <div className="progress-persona h-full w-2/3 rounded-full" />
          </div>
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-4">
          <div className="spinner-persona w-8 h-8" />
          <p className="text-sm text-muted-foreground">Loading spinner</p>
        </div>
      </section>

      {/* Shadow Effects */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Shadow Effects</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="shadow-persona bg-background p-6 rounded-xl">
            <p className="font-medium mb-2">Standard Shadow</p>
            <code className="text-xs">shadow-persona</code>
          </div>
          <div className="shadow-persona-lg bg-background p-6 rounded-xl">
            <p className="font-medium mb-2">Large Shadow</p>
            <code className="text-xs">shadow-persona-lg</code>
          </div>
        </div>
      </section>

      {/* Radial Progress Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Radial Progress (SVG)</h2>
        <div className="flex gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset="62.8"
                className="progress-ring-outer transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">75%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-medium mb-2">Automatic Ring Colors</p>
            <p className="text-sm text-muted-foreground">
              The <code>progress-ring-outer</code> and <code>progress-ring-inner</code> 
              classes automatically apply persona colors with glow effects.
            </p>
          </div>
        </div>
      </section>

      {/* Focus States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Focus States</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Focus me to see persona ring"
            className="focus-persona w-full px-4 py-2 rounded-lg border border-input bg-background"
          />
          <button className="focus-persona px-6 py-3 rounded-lg border border-input bg-background">
            Tab to focus
          </button>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Interactive Widget Example</h2>
        <Card className="card-persona max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-persona-primary">🎯</span>
              Algebra Progress
            </CardTitle>
            <CardDescription>Your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="progress-persona-track h-2 rounded-full">
                <div className="progress-persona h-full w-3/4 rounded-full transition-all duration-500" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-persona-overlay">
                <div className="text-2xl font-bold text-persona-primary">12</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-persona-overlay">
                <div className="text-2xl font-bold text-persona-secondary">85%</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-persona-overlay">
                <div className="text-2xl font-bold text-persona-accent">5</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>

            {/* CTA */}
            <button className="btn-persona w-full py-3 rounded-lg font-medium">
              Continue Learning
            </button>
          </CardContent>
        </Card>
      </section>

      {/* CSS Variables Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">CSS Variables Reference</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p className="font-bold mb-2">Colors (RGB values):</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>--persona-primary</li>
                  <li>--persona-secondary</li>
                  <li>--persona-accent</li>
                  <li>--persona-gradient-from</li>
                  <li>--persona-gradient-to</li>
                </ul>
              </div>
              <div>
                <p className="font-bold mb-2">Overlays & Effects:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>--persona-bg-overlay</li>
                  <li>--persona-border</li>
                  <li>--persona-shadow</li>
                  <li>--persona-gradient</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Tip: Use these in your CSS as <code>rgb(var(--persona-primary))</code>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Quick Tips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Tips</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-persona">
            <CardHeader>
              <CardTitle className="text-base">CSS Custom Properties</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Use CSS variables for dynamic theming:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                color: rgb(var(--persona-primary));
              </code>
            </CardContent>
          </Card>

          <Card className="border-persona">
            <CardHeader>
              <CardTitle className="text-base">Utility Classes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Use pre-built utility classes:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                className=&quot;btn-persona&quot;
              </code>
            </CardContent>
          </Card>

          <Card className="border-persona">
            <CardHeader>
              <CardTitle className="text-base">Tailwind Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Combine with Tailwind:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                className=&quot;rounded-lg shadow-persona-lg&quot;
              </code>
            </CardContent>
          </Card>

          <Card className="border-persona">
            <CardHeader>
              <CardTitle className="text-base">Dark Mode Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>All styles automatically adapt to dark mode</p>
              <p className="text-xs text-muted-foreground">No extra classes needed!</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

