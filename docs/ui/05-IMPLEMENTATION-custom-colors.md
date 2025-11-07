# Custom Colors Implementation Summary

## What We Built

Users can now customize their theme colors! They can override the persona defaults with their own primary and secondary colors.

---

## Changes Made

### 1. Database Schema (`apps/web/db/schema.ts`)
Added two new columns to `users` table:
- `primaryColor` - varchar(7) - Hex color (e.g., "#8B5CF6")
- `secondaryColor` - varchar(7) - Hex color (e.g., "#EC4899")

### 2. PersonaProvider Enhanced (`apps/web/components/PersonaProvider.tsx`)
- Now accepts `primaryColor` and `secondaryColor` props
- Dynamically overrides CSS custom properties when colors are set
- Converts hex to RGB and sets `--persona-primary`, `--persona-secondary`, etc.

### 3. Helper Function (`apps/web/lib/persona-utils.ts`)
- Added `hexToRgb()` function to convert hex colors to RGB strings
- Validates hex format before conversion

### 4. Layout Updated (`apps/web/app/(app)/layout.tsx`)
- Fetches user's custom colors from database
- Passes them to `PersonaProvider`

### 5. Settings Navigation Fixed
- **New:** `/app/settings` - Main settings page with cards
- Updated `UserMenu` to link to `/app/settings` instead of `/app/settings/rewards`
- Profile page back button now goes to `/app/settings`

### 6. Profile Settings Enhanced (`apps/web/app/(app)/app/settings/profile/page.tsx`)
- Added color picker UI using `react-color`'s `ChromePicker`
- Shows current colors with preview
- "Reset to Defaults" button to remove custom colors
- Live gradient preview
- Saves persona AND colors together

### 7. API Endpoint (`apps/web/app/api/user/colors/route.ts`)
- `POST /api/user/colors` - Updates user's custom colors
- Validates hex format (#RRGGBB)
- Allows null to reset to defaults

---

## How It Works

### Data Flow

```
User picks colors in Settings → 
POST /api/user/colors → 
Update users table (primaryColor, secondaryColor) →
Page refresh →
Layout fetches user colors →
PersonaProvider receives colors →
useEffect sets CSS custom properties →
All components automatically use new colors!
```

### CSS Override Mechanism

```typescript
// If user has custom primary color
if (primaryColor) {
  const rgb = hexToRgb(primaryColor); // "139 92 246"
  document.documentElement.style.setProperty("--persona-primary", rgb);
  document.documentElement.style.setProperty("--persona-gradient-from", rgb);
}

// If user resets (null)
else {
  document.documentElement.style.removeProperty("--persona-primary");
  // CSS defaults from personas.css take over
}
```

---

## User Experience

### Default Behavior (No Custom Colors)
1. User selects persona (student/parent/tutor)
2. Gets that persona's default colors from `personas.css`
3. All components render with persona theme

### Custom Colors Flow
1. User goes to **Settings** → **Profile**
2. Below persona selection, sees **Theme Colors** section
3. Clicks color swatch to open picker
4. Picks primary and/or secondary color
5. Sees live preview gradient
6. Clicks "Save All Changes"
7. Page refreshes, new colors applied everywhere!
8. Can click "Reset to Defaults" to go back

---

## Migration Required

**Run this after setting up your .env:**

```bash
cd apps/web
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

This will add the `primary_color` and `secondary_color` columns to the `users` table.

---

## Testing

### Test Custom Colors

1. Login to app
2. Go to `/app/settings`
3. Click "Profile"
4. Scroll to "Theme Colors"
5. Click primary color swatch
6. Pick a new color (e.g., red)
7. Click secondary color swatch
8. Pick another color (e.g., orange)
9. See gradient preview update
10. Click "Save All Changes"
11. Page refreshes → all buttons, cards, progress bars now use your colors!

### Test Reset

1. On Profile settings page
2. Click "Reset to Defaults"
3. Click "Save All Changes"
4. Page refreshes → back to persona default colors

### Test Persona Switch with Custom Colors

1. Set custom colors (e.g., red + orange)
2. Change persona from "Student" to "Parent"
3. Save
4. Notice: Your custom red/orange colors persist!
5. The persona only changes the default fallback colors

---

## Files Created

- `apps/web/app/(app)/app/settings/page.tsx` - Main settings hub
- `apps/web/app/api/user/colors/route.ts` - Color update API

## Files Modified

- `apps/web/db/schema.ts` - Added color columns
- `apps/web/components/PersonaProvider.tsx` - Color override logic
- `apps/web/lib/persona-utils.ts` - Added hexToRgb()
- `apps/web/app/(app)/layout.tsx` - Fetch and pass colors
- `apps/web/app/(app)/app/settings/profile/page.tsx` - Color pickers UI
- `apps/web/components/app-layout/UserMenu.tsx` - Fixed settings link

---

## Design Decisions

### Why Override CSS Custom Properties?

Instead of re-rendering components, we dynamically set CSS variables. This means:
- ✅ **Instant updates** - No component re-renders needed
- ✅ **All components adapt** - Anything using persona colors updates automatically
- ✅ **Minimal code changes** - No prop drilling or context updates
- ✅ **CSS handles everything** - Gradients, shadows, borders all update

### Why Allow Null (Reset)?

Users should always be able to go back to defaults:
- Removes custom colors from database (null)
- PersonaProvider removes CSS overrides
- CSS defaults from `personas.css` take over
- Clean UX: "Reset to Defaults" button only shows when custom colors exist

### Why Validate Hex Format?

- Prevents invalid colors breaking the UI
- Ensures consistent format (#RRGGBB)
- Server-side validation for security
- Helpful error messages

---

## Edge Cases Handled

### 1. Invalid Hex Color
```typescript
// API validates and rejects
if (primaryColor && !hexRegex.test(primaryColor)) {
  return { error: "Invalid format. Use #RRGGBB" };
}
```

### 2. Only One Color Custom
```typescript
// Works fine! Other color uses persona default
primaryColor: "#FF0000",  // Custom red
secondaryColor: null      // Use persona default
```

### 3. Switching Personas with Custom Colors
```typescript
// Custom colors persist across persona changes
// Only the fallback defaults change
Student (purple/pink) → custom (red/orange) → Parent (still red/orange)
```

### 4. Dark Mode
```typescript
// Custom colors work in both light and dark mode
// The RGB values are used in both contexts
```

---

## Future Enhancements (Not Implemented)

- [ ] Color palette presets ("Sunset", "Ocean", "Forest")
- [ ] Accessibility checker (contrast ratio validation)
- [ ] Custom accent color (third color)
- [ ] Per-subject color customization
- [ ] Export/import color themes
- [ ] Gradient angle customization

---

## Troubleshooting

### Colors not changing after save

**Check:**
1. Did page refresh happen? (Watch for "Refreshing..." message)
2. Are colors saved in database? (Check `/api/user/me` response)
3. Is PersonaProvider receiving colors? (Check React DevTools)

**Debug:**
```javascript
// In browser console
getComputedStyle(document.documentElement)
  .getPropertyValue('--persona-primary')
// Should show your RGB values
```

### Color picker not opening

**Check:**
1. Is `react-color` installed? (`pnpm list react-color`)
2. Any console errors?
3. Try clicking the color swatch directly

### Colors reset after logout

**This is expected!** Custom colors are per-user and stored in database. When you logout and login as different user, you see their colors (or defaults if they haven't customized).

---

## Related Documentation

- [Persona Theme System](./PERSONA-THEME-SYSTEM.md) - Full CSS theme documentation
- [Quick Start Guide](./quickstart-ui-implementation.md) - Implementation guide
- [PRD](./prd-ui-persona-integration.md) - Full product requirements

---

**Implementation Date:** November 7, 2025  
**Status:** ✅ Complete - Ready to test after migration

