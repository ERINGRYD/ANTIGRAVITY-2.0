# Style Guide

> **Stack:** React + TypeScript + Tailwind CSS  
> **Theme:** Light / Dark (Full support via `dark:` classes)  
> **Last updated:** March 2026
>
> **Critical rule:** Subject accent colors ALWAYS come from 
> `subject.color` data field — never hardcoded. This is the 
> most important visual rule in this codebase.

---

## 1. Color System

### Primary Colors (Tailwind Palette)

| Token | Value (Tailwind) | Usage |
|-------|------------------|-------|
| Primary | `blue-500` / `blue-600` | CTAs, active states, primary buttons, FAB, Focus Mode |
| Success | `emerald-500` / `emerald-600` | Completed states, positive feedback, cycle completion |
| Warning | `amber-500` / `amber-600` | Alert states, manual pause, waiting selection |
| Error | `red-500` / `red-600` | Critical states, destructive actions, Strict Mode |
| Purple | `purple-500` / `violet-500` | Long breaks, returning enemies, special states |
| Cyan | `cyan-500` / `cyan-600` | Short breaks |

### Neutral Colors

| Token | Value (Tailwind) | Usage |
|-------|------------------|-------|
| Background | `slate-50` (L) / `slate-950` (D) | Main page background |
| Card | `white` (L) / `slate-900` (D) | Card backgrounds, overlays |
| Border | `slate-100` (L) / `slate-800` (D) | Neutral borders, dividers |
| Border Hover | `slate-200` (L) / `slate-700` (D) | Hovered borders, active rings |
| Text Primary | `slate-900` (L) / `white` (D) | Main text, headings, active values |
| Text Secondary | `slate-500` (L) / `slate-400` (D) | Descriptions, inactive text |
| Text Muted | `slate-400` (L) / `slate-500` (D) | Labels, helper text, uppercase metadata |

### Subject Colors (Dynamic)

Subject colors are NEVER hardcoded. They come from the `subject.color` field in the data model.

**Usage pattern:**
- **Border:** `style={{ borderColor: subject.color }}` (full opacity)
- **Left Accent Border:** `style={{ borderLeftColor: subject.color }}`
- **Progress Fill:** `style={{ backgroundColor: subject.color }}` (full opacity)
- **Text:** `style={{ color: subject.color }}` (for percentage labels or icons)
- **Tinted Backgrounds:** `style={{ backgroundColor: \`${subject.color}15\` }}` (Hex with 15% opacity)

**Semantic Color Usage Rules**
✅ **CORRECT usage:**
- Success emerald (`emerald-500`): completion, positive achievement
- Warning amber (`amber-500`): alert, needs attention, paused states
- Error red (`red-500`): critical state, strict mode
- Primary blue (`blue-500`): primary actions, active focus

❌ **NEVER use:**
- Red for decorative purposes
- Green for non-completion states
- `subject.color` for generic UI elements (only subject-specific elements)
- Hardcoded hex codes outside of dynamic inline styles (use Tailwind classes instead)

---

## 2. Typography

### Type Scale

| Role | Size (Tailwind) | Weight | Color | Transform | Usage |
|------|-----------------|--------|-------|-----------|-------|
| Page title | `text-2xl` / `text-xl` | `font-black` | Primary | none | Screen headers |
| Card title | `text-lg` / `text-xl` | `font-black` | Primary | none | Subject names, topic names |
| Body | `text-sm` / `text-base` | `font-medium` | Secondary | none | General content |
| Label | `text-[10px]` | `font-black` | Muted | uppercase | Field labels, metadata, tracking |
| Value | `text-sm` | `font-bold` | Primary | none | Data values |
| Badge | `text-[9px]` / `text-[10px]`| `font-black` | varies | uppercase | Status badges |
| Timer | `text-6xl` to `text-8xl` | `font-black` | Primary | none | Countdown timers (`tabular-nums`) |

### Label Pattern (most common pattern in this codebase)

```text
FIELD LABEL (uppercase, muted, text-[10px], tracking-widest):
Value or content here (text-sm, font-bold, text-slate-900/white)
```

**Typography Rules**
✅ **Labels are ALWAYS:**
- Uppercase (`uppercase`)
- Letter-spaced (`tracking-widest` or `tracking-[0.2em]`)
- Muted color (`text-slate-400 dark:text-slate-500`)
- Small size (`text-[10px]`)
- Heavy weight (`font-black`)

✅ **Subject names are ALWAYS:**
- Large (`text-xl`)
- Extra Bold (`font-black`)
- Dark/Light responsive (`text-slate-900 dark:text-white`)
- Tight tracking (`tracking-tight`)

❌ **NEVER:**
- Mix uppercase labels with non-uppercase values
- Use full-opacity primary color for metadata labels
- Use regular weight (`font-normal`) for percentage values or timers

---

## 3. Spacing System

### Base Spacing Scale (Tailwind default)

| Token | Value | Common usage |
|-------|-------|--------------|
| `1` / `1.5` | 4px / 6px | Tight internal gaps, badge padding |
| `2` / `3` | 8px / 12px | Icon-to-text gap, compact padding, grid gaps |
| `4` | 16px | Standard component padding, standard gaps |
| `6` | 24px | Section padding, card padding |
| `8` | 32px | Large card padding (`p-8`) |
| `10` | 40px | Page section separation |

### Component-Specific Spacing

**Cards:**
- Padding: `p-6` or `p-8` (24px or 32px)
- Border radius: `rounded-[28px]` (large cards) or `rounded-xl` (standard cards)
- Gap between cards: `gap-4` or `gap-6`

**Progress bars:**
- Height (cycle): `h-3` (12px) or `h-1.5` (6px)
- Border radius: `rounded-full` (pill)

**Badges:**
- Padding: `px-2 py-0.5` or `px-3 py-1.5`
- Border radius: `rounded-full`

**Buttons:**
- Padding: `px-4 py-2` for standard
- Padding: `w-10 h-10` or `w-12 h-12` for icon buttons
- Border radius: `rounded-xl` or `rounded-full`

**FAB:**
- Size: `w-16 h-16` (64px × 64px)
- Position: `fixed bottom-6 right-6`

---

## 4. Elevation and Shadow System

### Shadow Scale

| Level | Tailwind Class | Usage |
|-------|----------------|-------|
| None | `shadow-none` | Flat cards, inactive states, permanently completed |
| Low | `shadow-sm` | Pending/inactive cards, standard inputs |
| Medium | `shadow-md` | Hovered cards, standard elevated elements |
| High | `shadow-lg` | Active/focused cards, floating menus |
| Colored | `shadow-blue-500/30` | Colored glow for active states (matches accent) |

### Elevation Rules
- **Active card:** `shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 scale-[1.01]`
- **Pending card:** `shadow-sm hover:shadow-md hover:scale-[1.01]`
- **Completed card:** `shadow-sm` (flat)
- **FAB button:** `shadow-lg` (always)

---

## 5. Border System

### Border Styles

**Card left accent border:**
- Width: `border-l-[8px]`
- Color: `style={{ borderLeftColor: subject.color }}`
- Radius: Applies naturally to the `rounded-[28px]` container

**Card outer border:**
- Default: `border border-slate-100 dark:border-slate-800`
- Active: `ring-1 ring-slate-200 dark:ring-slate-700`
  
**Progress bar track:**
- Background: `bg-[#F1F3F5] dark:bg-slate-800`
- No border

### Border Radius Standards
- Main Cards: `rounded-[28px]`
- Standard Cards/Modals: `rounded-2xl` or `rounded-3xl`
- Buttons/Icons: `rounded-xl` or `rounded-full`
- Badges/Pills/Progress: `rounded-full`

---

## 6. Component Visual Patterns

### Card Pattern (SubjectCard)
```css
/* Base classes */
className="relative w-full p-6 md:p-8 rounded-[28px] transition-all duration-300 border border-slate-100 dark:border-slate-800 border-l-[8px] flex flex-col justify-between bg-white dark:bg-slate-900 shadow-sm hover:shadow-md"

/* Dynamic style */
style={{ borderLeftColor: subject.color }}
```

### Badge Pattern
```css
/* Semantic badge (e.g., Focus Mode active) */
className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 shadow-sm"
```

### Button Pattern
```css
/* Primary Icon Button (Play) */
className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"

/* FAB */
className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
```

### Progress Bar Pattern
```css
/* Linear Progress Bar */
<div className="h-3 w-full bg-[#F1F3F5] dark:bg-slate-800 rounded-full overflow-hidden">
  <div 
    className="h-full rounded-full transition-all duration-700"
    style={{ width: `${percent}%`, backgroundColor: subject.color }}
  />
</div>
```

---

## 7. Animation and Transition System

### Transition Standards
- **Default interaction:** `transition-all duration-300` (hover states, scaling)
- **Color/Theme changes:** `transition-colors duration-700` (smooth dark mode toggles)
- **Progress bars:** `transition-all duration-1000 ease-out` (smooth filling)
- **Page/Modal entrance:** `animate-in fade-in slide-in-from-bottom duration-500`

### Named Animations (Tailwind / Custom)
- **Pulse:** `animate-pulse` (used for active timer dots, waiting states)
- **Bounce:** `animate-bounce` (used for transition icons, active indicators)
- **Scale on Interaction:** `hover:scale-110 active:scale-95` or `hover:scale-[1.01]`

**Transition Rules**
✅ **ALWAYS use CSS transitions for:**
- Color changes on hover/state
- Transform changes (scale on hover/active)
- Width changes (progress bars)

❌ **NEVER use:**
- JavaScript-based animation libraries (e.g., Framer Motion) unless absolutely necessary for complex layout shifts (currently `motion/react` is used ONLY for `AnimatePresence` in `App.tsx`).
- `setTimeout` for visual transitions (use CSS).

---

## 8. Layout Patterns

### Page Layout
- **Mobile (< 768px):** Single column, `px-4`, bottom navigation bar.
- **Desktop (≥ 768px):** Sidebar navigation, flex-1 content area, `max-w-6xl` or `max-w-2xl` centered content.
- **Scroll:** `overflow-y-auto no-scrollbar pb-[100px]` (to account for FAB/BottomNav).

### Stack Pattern (vertical content)
```tsx
<div className="flex flex-col gap-1">
  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Label</span>
  <h3 className="text-xl font-black text-slate-900">Value</h3>
</div>
```

---

## 9. Icon Usage

### Icon System
- **Source:** Google Material Icons Round (`material-icons-round`)
- **Usage:** `<span className="material-icons-round text-xl">play_arrow</span>`

### Size standards:
- Inline/Small: `text-sm`
- Standard: `text-lg` or `text-xl`
- Large (Empty States/Timers): `text-4xl` to `text-6xl`

### Icon Rules
✅ **ALWAYS:**
- Use `material-icons-round` class.
- Size icons using Tailwind text sizes (`text-xl`).

❌ **NEVER:**
- Import SVG files directly for standard UI icons.
- Use a different icon weight (e.g., sharp, outlined) — stick to `round`.

---

## 10. Code Style Patterns

### Component File Structure
```tsx
// 1. Imports
import React, { useState, useMemo, useEffect } from 'react';
import { Subject, Tab } from '../types';
import { useApp } from '../contexts/AppContext';
import ChildComponent from './ChildComponent';

// 2. Interface definition
interface ComponentNameProps {
  subject: Subject;
  isActive: boolean;
  onAction?: () => void;
}

// 3. Component function
const ComponentName: React.FC<ComponentNameProps> = ({ subject, isActive, onAction }) => {
  // 3a. Hooks
  const { isDarkMode } = useApp();
  const [localState, setLocalState] = useState(false);
  
  // 3b. Derived values
  const computedValue = useMemo(() => { ... }, [subject]);
  
  // 3c. Effects
  useEffect(() => { ... }, [isActive]);
  
  // 3d. Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

// 4. Default export
export default ComponentName;
```

### Naming Conventions
- **Components:** PascalCase (`SubjectCard`)
- **Hooks:** camelCase with `use` prefix (`useStudyTimer`)
- **Types/Interfaces:** PascalCase (`SubjectCycleState`)
- **Event handlers:** `handle` + Action (`handleTimerComplete`)
- **Callback props:** `on` + Action (`onRecordSession`)
- **Boolean props:** `is` or `has` (`isActive`, `isPermanentlyCompleted`)

### Conditional Rendering Patterns
```tsx
// ✅ CORRECT — short circuit for simple conditions
{isActive && <ActiveBadge />}

// ✅ CORRECT — ternary for either/or
{isCompleted ? <CompletedState /> : <PendingState />}

// ❌ AVOID — && with non-boolean left side
{items.length && <List />}  // renders "0" when empty
// USE:
{items.length > 0 && <List />}
```

### TypeScript Patterns
```tsx
// ✅ ALWAYS use optional chaining for nullable access
const name = subject?.topics?.[0]?.name ?? 'Geral';

// ❌ NEVER use as any
const value = data as any;  // forbidden
```

---

## 11. Responsive Design Patterns

### Breakpoints
- **Mobile:** `< 768px` (default — mobile first)
- **Desktop:** `≥ 768px` (`md:` prefix in Tailwind)
- **Large Desktop:** `≥ 1024px` (`lg:` prefix in Tailwind)

### Mobile-First Rules
✅ Default styles are mobile.
✅ Desktop overrides use `md:` or `lg:` prefix (e.g., `flex-col md:flex-row`).
✅ Touch targets are generous (e.g., buttons are `w-10 h-10` or `w-12 h-12`).

---

## 12. Accessibility Standards

### Required for every component
- **Semantic HTML:** Use `<header>`, `<main>`, `<section>`, `<button>`.
- **Color Contrast:** Muted text (`slate-400`) must still be readable against its background (`slate-50` or `slate-900`).
- **Screen Readers:** Icons used as buttons should ideally have `aria-label` (though currently underutilized in the codebase, this is the standard to strive for).

---

## 13. Anti-Patterns (Never Do)

**ANTI-001 — Hardcoded subject colors**
❌ `className="border-blue-500"` or `style={{ borderColor: '#3B82F6' }}`
✅ `style={{ borderColor: subject.color }}` (Color MUST come from data)

**ANTI-002 — Lifting rapidly changing state unnecessarily**
❌ Moving `secondsLeft` from `FocusModeView` up to `App.tsx`.
✅ Keep 1-second interval state as low in the component tree as possible to prevent app-wide re-renders.

**ANTI-003 — Mixing UI state with Data Models**
❌ Adding `isDragging` or `isExpanded` directly to the `Subject` interface in `types.ts`.
✅ Keep UI state local to the component (`useState`) or in a UI-specific wrapper type.

**ANTI-004 — Using `as any` to bypass strict types**
❌ `const theme = subject as any;`
✅ Use proper type guards or the `subjectToTheme` adapter.

**ANTI-005 — Non-pill progress bars**
❌ `border-radius: 4px` on progress bars
✅ `rounded-full` (always pill shape)

---

## Style Audit

### Inconsistencies found in codebase
- **Border Radius on Cards:** `SubjectCard` uses `rounded-[28px]`, while other cards (like `StatCard` in `FocusModeView`) might use `rounded-xl` or `rounded-2xl` or `rounded-3xl`. 
  *Recommendation:* Standardize main content cards to `rounded-[28px]` and secondary cards to `rounded-2xl`.
- **Icon Buttons:** Some use `w-10 h-10`, others use `w-12 h-12` or `w-9 h-9`.
  *Recommendation:* Standardize to `w-10 h-10` for standard icon buttons and `w-12 h-12` for primary/header actions.
- **Dark Mode Backgrounds:** `App.tsx` uses `bg-slate-950` for the main background, but some overlays or cards use `bg-slate-900`. 
  *Recommendation:* Ensure `slate-950` is strictly for the page background and `slate-900` is for elevated surfaces (cards).

### Missing patterns
- **Focus Rings:** Custom focus rings (`focus:ring`) are largely absent, relying on browser defaults.
- **Aria Labels:** Many icon-only buttons lack `aria-label` attributes for screen readers.

### Deprecated patterns
- **Legacy Subject Model:** The codebase is transitioning from `Subject`/`Topic` to `Theme`/`SubjectCycleState`. Components should prefer the new models or use the adapters provided in `src/adapters/`.
