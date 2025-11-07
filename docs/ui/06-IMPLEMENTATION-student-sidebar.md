# Student Right Sidebar Implementation

## Overview

Created a dedicated right sidebar for the student persona that displays:
- Agent Buddy with XP/Level
- Streak tracking with "Streak Rescue" CTA
- Recent badges
- Subscribed subjects with presence indicators
- Cohort groups with presence indicators

---

## Files Created

### `apps/web/components/app-layout/StudentSidebar.tsx`
**Client component** that renders the student-specific right sidebar.

**Features:**
- **Agent Buddy Section**: Scaled up buddy avatar with XP and Level display
- **Streak Section**: Shows current streak with conditional "At Risk" warning and Streak Rescue button
- **Badges Grid**: 3x2 grid of recent badge emojis (links to rewards page)
- **My Subjects**: Thin cards showing each subject with active user count
- **My Cohorts**: Thin cards linking to cohort detail pages with presence indicators

---

## Layout Changes

### `apps/web/app/(app)/layout.tsx`

**Grid Layout:**
- **Students**: `grid-cols-[260px_1fr_130px]` (left nav, content, right sidebar)
- **Parents/Tutors**: `grid-cols-[260px_1fr]` (left nav, content only)

**Conditional Rendering:**
```typescript
{persona === "student" && (
  <StudentSidebar
    userId={session.user.id}
    userName={session.user.name}
    persona={persona}
    data={sidebarData}
  />
)}
```

**Data Fetching:**
Added `fetchStudentSidebarData()` helper function that:
- Calculates real streak from database
- Fetches user's cohorts
- Extracts unique subjects from results
- Determines if streak is at risk (after 8 PM)
- Returns mock badges (TODO: integrate with rewards system)
- Returns mock presence counts (TODO: integrate with presence system)

---

## Component Structure

### StudentSidebar Props

```typescript
interface StudentSidebarProps {
  userId: string;
  userName: string | null | undefined;
  persona: "student" | "parent" | "tutor";
  data: {
    xp: number;
    level: number;
    streak: number;
    streakAtRisk: boolean;
    badges: Array<{
      id: string;
      name: string;
      icon: string;
      earnedAt: Date;
    }>;
    subjects: Array<{
      name: string;
      activeUsers: number;
    }>;
    cohorts: Array<{
      id: string;
      name: string;
      subject: string;
      activeUsers: number;
    }>;
  };
}
```

---

## Styling & Theming

All components use persona-aware styling:

```typescript
// Persona overlays
bg-persona-overlay
border-persona

// Gradient backgrounds
bg-gradient-to-br from-orange-50 to-red-50

// Conditional styling
{data.streakAtRisk 
  ? "border-orange-300" 
  : "border-yellow-300"}
```

---

## Features Detail

### 1. Agent Buddy + XP/Level
- Centered buddy avatar (scaled 125%)
- Card showing Level (large) and XP (smaller)
- Uses persona colors for accents

### 2. Streak Section
- **Normal State**: Yellow/orange gradient with flame icon
- **At Risk State**: Orange/red gradient with warning text
- **Streak Rescue Button**: Appears when streak is at risk, links to practice

### 3. Badges
- Shows up to 6 recent badges in 3x2 grid
- Each badge is a clickable emoji with hover scale effect
- "View All" link to `/app/rewards`

### 4. Subjects
- Thin cards for each subject
- Badge showing active user count with Users icon
- Hover effect for interaction

### 5. Cohorts
- Thin cards linking to cohort detail pages
- Subject name shown as secondary text
- Active user count badge
- Shows up to 5 cohorts, "View All" link to `/app/cohorts`

---

## Data Flow

```
Layout (Server Component)
  ↓
fetchStudentSidebarData()
  ↓ queries DB for:
  • Cohorts (real)
  • Results → Subjects (real)
  • Streak (real)
  • Badges (mock - TODO)
  • Presence counts (mock - TODO)
  ↓
StudentSidebar (Client Component)
  ↓ renders UI with:
  • AgentBuddy
  • Cards & Badges
  • Interactive links
```

---

## TODOs & Future Enhancements

### Immediate
- [ ] Remove Agent Buddy from header (now in right sidebar)
- [ ] Calculate real XP and Level from results
- [ ] Integrate with rewards system for real badges
- [ ] Integrate with presence system for real active user counts

### Phase 2
- [ ] Add "Idle Game" section below Agent Buddy
- [ ] Show inventory items
- [ ] Add subject practice quick-launch buttons
- [ ] Animate streak rescue CTA
- [ ] Add badge unlock animations

### Phase 3
- [ ] Real-time presence updates via SSE
- [ ] Expandable cohort cards with member avatars
- [ ] Subject mastery progress bars
- [ ] Quick-invite buttons for subjects/cohorts

---

## Width Adjustment

Current right sidebar width: **130px**

To adjust:
```typescript
// In layout.tsx, change grid-cols value:
persona === "student" 
  ? "grid-cols-[260px_1fr_180px]"  // Wider sidebar
  : "grid-cols-[260px_1fr]"
```

Recommended widths:
- **130px**: Compact, icon-focused
- **180px**: Comfortable, more breathing room
- **220px**: Spacious, detailed cards

---

## Testing

1. **View as Student**: Should see 3-column layout with right sidebar
2. **View as Parent/Tutor**: Should see 2-column layout (no right sidebar)
3. **Streak At Risk**: Set system time after 8 PM to test warning
4. **Subjects**: Create results with different subjects to populate list
5. **Cohorts**: Create cohorts to populate list

---

## Visual Hierarchy

```
┌─────────────────────────┐
│   Agent Buddy (large)   │
│   ┌─────────────────┐   │
│   │ Lvl 5  |  1250 XP│   │
│   └─────────────────┘   │
├─────────────────────────┤
│   🔥 5 Day Streak       │
│   [Streak Rescue]       │ (if at risk)
├─────────────────────────┤
│   🏆 Recent Badges      │
│   [🎯][⚡][💯]          │
│   [🔥][⭐][🎓]          │
├─────────────────────────┤
│   📚 My Subjects        │
│   ┌─────────────────┐   │
│   │ Algebra     👥 12│   │
│   ├─────────────────┤   │
│   │ Geometry    👥 8 │   │
│   └─────────────────┘   │
├─────────────────────────┤
│   👥 My Cohorts         │
│   ┌─────────────────┐   │
│   │ Math Warriors   │   │
│   │ Algebra     👥 5 │   │
│   └─────────────────┘   │
└─────────────────────────┘
```

---

## Notes

- Sidebar is scrollable if content exceeds viewport height
- All interactive elements have hover states
- Persona colors applied via CSS custom properties
- Empty states handled with fallback subjects
- Mobile responsiveness TBD (future iteration)

---

**Status**: ✅ Complete  
**Last Updated**: November 7, 2025

