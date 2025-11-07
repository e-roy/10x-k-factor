# Persona Theme System

## Overview

The Persona Theme System provides automatic color theming based on user persona (student, parent, tutor) using CSS custom properties and utility classes. All colors adapt automatically when the persona changes, and the system fully supports dark mode.

---

## Quick Start

### 1. The theme is already set up!

The `PersonaProvider` is already integrated in the app layout. It automatically sets the `data-persona` attribute on `<html>` based on the logged-in user's persona.

### 2. Use theme utilities in your components

```tsx
// Gradient background button
<button className="btn-persona px-6 py-3 rounded-lg">
  Click me
</button>

// Card with persona overlay
<Card className="card-persona">
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
</Card>

// Text with persona color
<h2 className="text-persona-primary">
  Hello, Student!
</h2>
```

### 3. Test it!

Visit `http://localhost:3000/app` and you'll see your persona colors automatically applied throughout the app.

---

## Persona Colors

### Student (Default) 🎓
- **Primary**: Purple (`#8B5CF6`)
- **Secondary**: Pink (`#EC4899`)
- **Accent**: Amber (`#F59E0B`)
- **Style**: Playful, gamified

### Parent 👨‍👩‍👧‍👦
- **Primary**: Blue (`#3B82F6`)
- **Secondary**: Cyan (`#06B6D4`)
- **Accent**: Green (`#10B981`)
- **Style**: Professional, trustworthy

### Tutor 📚
- **Primary**: Green (`#10B981`)
- **Secondary**: Green-600 (`#059669`)
- **Accent**: Indigo (`#6366F1`)
- **Style**: Professional, efficient

---

## CSS Custom Properties

All theme colors are available as CSS custom properties:

```css
/* Colors (RGB values without rgb() wrapper) */
--persona-primary: 139 92 246;
--persona-secondary: 236 72 153;
--persona-accent: 245 158 11;

/* Gradients */
--persona-gradient-from: 139 92 246;
--persona-gradient-to: 236 72 153;
--persona-gradient: linear-gradient(135deg, ...);

/* Overlays (with opacity) */
--persona-bg-overlay: 139 92 246 / 0.1;
--persona-bg-overlay-hover: 139 92 246 / 0.15;

/* Borders */
--persona-border: 139 92 246 / 0.3;
--persona-border-strong: 139 92 246 / 0.5;

/* Shadows */
--persona-shadow: 139 92 246 / 0.5;
```

### Using in CSS

```css
/* In your CSS files */
.my-component {
  /* Use with rgb() wrapper */
  color: rgb(var(--persona-primary));
  background: rgb(var(--persona-bg-overlay));
  border: 1px solid rgb(var(--persona-border));
  
  /* Or use the pre-built gradient */
  background: var(--persona-gradient);
}
```

### Using in Inline Styles

```tsx
<div
  style={{
    background: `rgb(var(--persona-primary))`,
    boxShadow: `0 4px 12px rgb(var(--persona-shadow))`,
  }}
>
  Content
</div>
```

---

## Utility Classes

Pre-built utility classes for common patterns:

### Backgrounds

```tsx
<div className="bg-persona-primary">Primary background</div>
<div className="bg-persona-secondary">Secondary background</div>
<div className="bg-persona-gradient">Gradient background</div>
<div className="bg-persona-overlay">Subtle overlay (10% opacity)</div>
<div className="hover:bg-persona-overlay-hover">Hover overlay</div>
```

### Text Colors

```tsx
<h1 className="text-persona-primary">Primary text</h1>
<h2 className="text-persona-secondary">Secondary text</h2>
<p className="text-persona-accent">Accent text</p>
```

### Borders

```tsx
<div className="border border-persona">Subtle border</div>
<div className="border-2 border-persona-strong">Strong border</div>
```

### Shadows

```tsx
<div className="shadow-persona">Standard shadow</div>
<div className="shadow-persona-lg">Large shadow</div>
```

### Buttons

```tsx
{/* Gradient button with hover effects */}
<button className="btn-persona px-6 py-3 rounded-lg">
  Primary Action
</button>

{/* Outline button */}
<button className="btn-persona-outline px-6 py-3 rounded-lg">
  Secondary Action
</button>
```

### Cards

```tsx
{/* Card with subtle persona gradient background */}
<Card className="card-persona">
  <CardHeader>...</CardHeader>
</Card>

{/* Card with glow effect on hover */}
<Card className="glow-persona">
  <CardHeader>...</CardHeader>
</Card>
```

### Badges

```tsx
<Badge className="badge-persona">New</Badge>
```

### Progress Bars

```tsx
<div className="progress-persona-track h-2 rounded-full">
  <div className="progress-persona h-full w-3/4 rounded-full" />
</div>
```

### Loading Spinners

```tsx
<div className="spinner-persona w-8 h-8" />
```

### SVG Rings (for radial progress)

```tsx
<svg className="-rotate-90" viewBox="0 0 100 100">
  <circle
    className="progress-ring-outer"
    cx="50"
    cy="50"
    r="40"
    fill="none"
    strokeWidth="8"
  />
</svg>
```

### Focus States

```tsx
<input className="focus-persona" />
<button className="focus-persona">Button</button>
```

---

## TypeScript Utilities

### Get Persona Configuration

```tsx
import { getPersonaConfig, getPersonaIcon } from "@/lib/persona-utils";

const config = getPersonaConfig("student");
// Returns: { name, icon, description, primaryColor, secondaryColor, style }

const icon = getPersonaIcon("student");
// Returns: "🎓"
```

### Get CSS Variables at Runtime

```tsx
import { getPersonaCSSVars, getPersonaCSSVar } from "@/lib/persona-utils";

// Get all vars
const vars = getPersonaCSSVars();
// Returns: { primary: "139 92 246", secondary: "...", ... }

// Get single var
const primary = getPersonaCSSVar("--persona-primary");
// Returns: "139 92 246"
```

### Check Persona Style

```tsx
import { isPlayfulPersona, isProfessionalPersona } from "@/lib/persona-utils";

if (isPlayfulPersona("student")) {
  // Show animations, gamified UI
}

if (isProfessionalPersona("parent")) {
  // Show clean, data-driven UI
}
```

---

## Common Patterns

### Pattern 1: Persona-Aware Card

```tsx
<Card className="card-persona">
  <CardHeader>
    <CardTitle className="text-persona-primary flex items-center gap-2">
      <span>{getPersonaIcon(persona)}</span>
      Your Progress
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="progress-persona-track h-2 rounded-full">
      <div className="progress-persona h-full w-2/3" />
    </div>
  </CardContent>
</Card>
```

### Pattern 2: Gradient CTA Button

```tsx
<button className="btn-persona w-full py-3 rounded-lg font-medium">
  Continue Learning
</button>
```

### Pattern 3: Stats with Persona Colors

```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="bg-persona-overlay rounded-lg p-4 text-center">
    <div className="text-3xl font-bold text-persona-primary">12</div>
    <p className="text-sm text-muted-foreground">Sessions</p>
  </div>
  <div className="bg-persona-overlay rounded-lg p-4 text-center">
    <div className="text-3xl font-bold text-persona-secondary">85%</div>
    <p className="text-sm text-muted-foreground">Score</p>
  </div>
  <div className="bg-persona-overlay rounded-lg p-4 text-center">
    <div className="text-3xl font-bold text-persona-accent">5</div>
    <p className="text-sm text-muted-foreground">Streak</p>
  </div>
</div>
```

### Pattern 4: Radial Progress Widget

```tsx
<div className="relative w-40 h-40">
  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
    {/* Background circle */}
    <circle
      cx="80"
      cy="80"
      r="70"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      className="text-muted opacity-20"
    />
    
    {/* Progress circle with persona color */}
    <circle
      cx="80"
      cy="80"
      r="70"
      fill="none"
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      className="progress-ring-outer transition-all duration-500"
    />
  </svg>
  
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <div className="text-4xl font-bold">5</div>
    <div className="text-xs text-muted-foreground">Level</div>
  </div>
</div>
```

### Pattern 5: Agent Buddy Speech Bubble

```tsx
<div
  className="rounded-2xl p-4 shadow-lg border border-persona"
  style={{
    background: `linear-gradient(135deg, rgb(var(--persona-gradient-from) / 0.1) 0%, rgb(var(--persona-gradient-to) / 0.1) 100%)`,
  }}
>
  <p className="text-sm font-medium">{copy}</p>
  <button className="btn-persona mt-3 w-full py-2 rounded-lg text-sm">
    {actionLabel}
  </button>
  
  {/* Speech bubble tail */}
  <div className="speech-bubble-tail -right-2 top-6" />
</div>
```

---

## Examples by Use Case

### Student Dashboard

```tsx
function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero with gradient */}
      <div className="bg-persona-gradient rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">Welcome back! 🎯</h1>
        <p className="mt-2 opacity-90">Ready to level up today?</p>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id} className="card-persona">
            <CardHeader>
              <CardTitle className="text-persona-primary">
                {subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Radial progress widget here */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <button className="btn-persona w-full py-4 rounded-xl text-lg font-semibold">
        Start Practice Session
      </button>
    </div>
  );
}
```

### Parent Dashboard

```tsx
function ParentDashboard() {
  return (
    <div className="space-y-6">
      {/* Clean header */}
      <div className="border-l-4 border-persona-strong pl-6">
        <h1 className="text-2xl font-semibold">Sarah's Progress</h1>
        <p className="text-muted-foreground">This week's activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="border-persona">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-persona-primary">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share button */}
      <button className="btn-persona-outline px-6 py-3 rounded-lg">
        Share Progress
      </button>
    </div>
  );
}
```

### Tutor Dashboard

```tsx
function TutorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header with accent */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Today's Sessions</h1>
        <Badge className="badge-persona text-base px-4 py-1">
          3 upcoming
        </Badge>
      </div>

      {/* Session list */}
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-persona transition-shadow">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-persona-overlay flex items-center justify-center">
              <span className="text-2xl">{session.studentIcon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{session.studentName}</h3>
              <p className="text-sm text-muted-foreground">{session.subject}</p>
            </div>
            <button className="btn-persona-outline px-4 py-2 rounded-lg text-sm">
              Start Session
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Testing & Debugging

### View the Theme Demo

Add the demo component to any page:

```tsx
import { PersonaThemeDemo } from "@/components/PersonaThemeDemo";

export default function TestPage() {
  return <PersonaThemeDemo />;
}
```

### Check Current Persona in DevTools

Open browser console:

```javascript
// Check data-persona attribute
document.documentElement.getAttribute('data-persona')
// Returns: "student" | "parent" | "tutor"

// Check CSS variable value
getComputedStyle(document.documentElement)
  .getPropertyValue('--persona-primary')
// Returns: "139 92 246" (or current persona's color)
```

### Test Persona Switching

Temporarily change persona:

```javascript
// In browser console
document.documentElement.setAttribute('data-persona', 'parent');
// Watch colors update instantly!

document.documentElement.setAttribute('data-persona', 'tutor');
document.documentElement.setAttribute('data-persona', 'student');
```

---

## Dark Mode Support

All persona colors automatically adapt to dark mode:

```css
/* Automatically lighter overlays in dark mode */
.dark {
  --persona-bg-overlay: var(--persona-gradient-from) / 0.15;
  --persona-border: var(--persona-gradient-from) / 0.4;
}
```

No extra classes or code needed! Just use the utilities and they'll adapt.

---

## Best Practices

### ✅ DO

- Use utility classes for common patterns (`btn-persona`, `card-persona`)
- Use CSS custom properties for custom components
- Combine with Tailwind utilities (`rounded-lg shadow-persona`)
- Test in both light and dark mode
- Test with all three personas

### ❌ DON'T

- Hardcode hex colors when persona colors are available
- Use `!important` to override persona styles
- Create persona-specific components (use theming instead)
- Forget to test dark mode

---

## Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
<button className="bg-purple-500 hover:bg-purple-600">
  Click me
</button>
```

**After:**
```tsx
<button className="btn-persona">
  Click me
</button>
```

### From Tailwind Colors

**Before:**
```tsx
<Card className="border-blue-500">
  <CardTitle className="text-blue-700">Title</CardTitle>
</Card>
```

**After:**
```tsx
<Card className="border-persona">
  <CardTitle className="text-persona-primary">Title</CardTitle>
</Card>
```

---

## Troubleshooting

### Colors not changing when persona changes

**Issue:** Colors stay the same for all personas

**Solution:**
1. Check that `PersonaProvider` is in the layout
2. Check that `data-persona` attribute is set on `<html>`
3. Clear browser cache and hard refresh

### CSS variables showing as undefined

**Issue:** `var(--persona-primary)` not working

**Solution:**
1. Make sure `personas.css` is imported in `global.css`
2. Check import order (should be after Tailwind)
3. Restart dev server

### Dark mode colors look wrong

**Issue:** Colors too bright or too dark in dark mode

**Solution:**
1. Check if `.dark` class is applied to `<html>`
2. Verify dark mode adjustments in `personas.css`
3. Test opacity values

---

## File Reference

- **CSS**: `apps/web/styles/personas.css`
- **Provider**: `apps/web/components/PersonaProvider.tsx`
- **Utilities**: `apps/web/lib/persona-utils.ts`
- **Demo**: `apps/web/components/PersonaThemeDemo.tsx`
- **Import**: `apps/web/styles/global.css`

---

## Next Steps

1. **Try the demo**: Add `<PersonaThemeDemo />` to a page
2. **Build a component**: Use the utility classes
3. **Test all personas**: Switch between student/parent/tutor
4. **Check dark mode**: Toggle dark mode in your browser
5. **Read the main PRD**: See `docs/prd-ui-persona-integration.md`

---

**Questions?** Check the full implementation in `apps/web/styles/personas.css` or review `PersonaThemeDemo.tsx` for examples.

_Last Updated: November 7, 2025_

