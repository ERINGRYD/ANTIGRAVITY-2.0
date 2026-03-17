# SubjectCard

**File:** `src/components/SubjectCard.tsx`  
**Category:** Card  
**Complexity:** High  
**Status:** Active  
**Last updated:** March 2026

---

## Purpose

This component displays a subject's progress within a study cycle. It visually communicates whether a subject is currently active, pending, or completed for the rotation. It also handles drag-and-drop interactions for reordering the cycle queue.

---

## Props
```typescript
interface SubjectCardProps {
  // Required props
  subject: Subject;
  // Description: The legacy subject data model containing name, color, and topics.
  // Constraints: Must have a valid `id`, `name`, and `color`.
  // Effect on render: Determines the primary label, left border color, and progress calculations.

  isActive: boolean;
  // Description: Whether this subject is the currently active one in the cycle.
  // Constraints: Boolean.
  // Effect on render: Triggers the "Active" visual state (State 1) if true.

  // Optional props
  cycleState?: SubjectCycleState;
  // Description: The new data model for cycle progress.
  // Default: Derived from `subject.studiedMinutes` and `subject.totalMinutes`.
  // Effect on render: Drives the circular progress bar.

  themes?: Theme[];
  // Description: The new data model for subject content.
  // Default: Derived from `subject.topics`.
  // Effect on render: Drives the linear progress bar (completed themes / total themes).

  cardIndex?: number;
  // Description: The position of the card in the list.
  // Default: 0
  // Effect on render: Displays "MATÉRIA {cardIndex + 1}" in the top left.

  isPermanentlyCompleted?: boolean;
  // Description: Whether all themes for this subject are finished forever.
  // Default: Computed based on `themes` completion status.
  // Effect on render: Triggers the "Permanently Completed" visual state (State 4).

  onPress?: () => void;
  // Called when: The card is clicked (mobile/touch).

  onClick?: (id: string) => void;
  // Called when: The card is clicked (desktop). Passes the subject ID.

  onPlay?: (id: string) => void;
  // Called when: The "Play" button is clicked in the Active state.

  draggable?: boolean;
  // Description: Enables HTML5 drag-and-drop.
  
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isEditMode?: boolean;
}
```

### Props Table

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| subject | Subject | Yes | — | Core subject data |
| isActive | boolean | Yes | — | Is the current cycle target |
| cycleState | SubjectCycleState | No | Computed | New cycle progress model |
| themes | Theme[] | No | Computed | New content progress model |
| cardIndex | number | No | 0 | Display index |
| isPermanentlyCompleted | boolean | No | Computed | Is 100% mastered |
| onPress | () => void | No | undefined | Touch handler |
| onClick | (id: string) => void | No | undefined | Click handler |
| onPlay | (id: string) => void | No | undefined | Start study session |
| draggable | boolean | No | false | Enables D&D |
| isEditMode | boolean | No | false | Shows drag handles |

---

## Visual States

### State: Active (State 1)
**Condition:** `isActive === true` and `isRotationCompleted === false` and `isPermanentlyCompleted === false`  
**Screenshot description:** The card is slightly scaled up with a prominent shadow. A blue "Play" button is visible in the top right.
- Background: `bg-white` (light) / `bg-slate-900` (dark)
- Border: `ring-1 ring-slate-200`
- Left Border: `border-l-[8px]` (subject color)
- Shadow: `shadow-lg`
- Interactions available: Click to view details, click Play to start studying.

### State: Cycle Completed (State 2)
**Condition:** `isRotationCompleted === true` and `isPermanentlyCompleted === false`  
**Screenshot description:** The card indicates the time goal for the current rotation is met. A green checkmark badge appears in the top right.
- Background: `bg-white` (light) / `bg-slate-900` (dark)
- Border: `border-slate-100`
- Badge: Green checkmark icon (`bg-emerald-100 text-emerald-600`)
- Interactions available: Click to view details.

### State: Pending (State 3)
**Condition:** `isActive === false` and `isRotationCompleted === false` and `isPermanentlyCompleted === false`  
**Screenshot description:** The default state. A standard card waiting its turn in the cycle.
- Background: `bg-white` (light) / `bg-slate-900` (dark)
- Border: `border-slate-100`
- Shadow: `shadow-sm hover:shadow-md`
- Interactions available: Click to view details. Hover to slightly scale up.

### State: Permanently Completed (State 4)
**Condition:** `isPermanentlyCompleted === true` (all themes are 100% done)  
**Screenshot description:** The card is greyed out and semi-transparent. The title has a strikethrough. The circular cycle progress is hidden.
- Background: `bg-white` (light) / `bg-slate-900` (dark)
- Opacity: `opacity-60 grayscale`
- Text: `line-through decoration-slate-300`
- Interactions available: None (clicks are disabled unless in edit mode).

### State: Dragging
**Condition:** `isDragging === true`  
**Screenshot description:** The card becomes semi-transparent with a dashed blue border while being dragged.
- Border: `border-dashed border-blue-400`
- Opacity: `opacity-50`
- Transform: `scale-95`

### State: Drop Target
**Condition:** `isDropTarget === true`  
**Screenshot description:** The card highlights blue to indicate it is the target for a drop operation.
- Background: `bg-blue-50`
- Border: `border-blue-500`
- Transform: `scale-105`

---

## State Transition Diagram

```text
[Pending] ──── becomes active ────→ [Active]
    ↑                                  │
    │                                  │ studies until goal
    │                                  ↓
    └──────── cycle resets ──────── [Cycle Completed]
                                       │
                                       │ all themes mastered
                                       ↓
                            [Permanently Completed]
```

---

## Behavior

**On mount:**
- Computes derived values for `effectiveThemes` and `effectiveCycleState` if the new data models are not provided (legacy fallback).
- Calculates `contentProgressPercent` (linear bar) and `cycleProgressPercent` (circular bar).

**On prop change:**
- When `subject.studiedMinutes` or `subject.totalMinutes` changes, the circular progress bar animates to the new percentage.

**Animations:**
- **Circular Progress:** The SVG `strokeDashoffset` animates over 1000ms with an `ease-out` timing function when the percentage changes.
- **Hover/Active Scale:** The card scales up (`scale-[1.01]`) on hover or when active, transitioning over 300ms.

**Internal State:**
- No internal state — fully controlled by props.

---

## Children and Composition

### Components rendered by this component
`SubjectCard` renders:
  └── `CircularProgress` — Always (unless State 4): A local functional component that renders the SVG circle for cycle progress.

---

## Context Dependencies
- No context dependencies: Fully standalone and pure.

---

## Hook Dependencies
- No hooks used.

---

## Accessibility
- Semantic HTML: Uses standard `div` elements. Could be improved by using `<article>` or `<button>` for the main clickable area.
- Keyboard navigation: The main card and the Play button lack `tabIndex` and `onKeyDown` handlers, making keyboard navigation difficult.
- Screen reader: The circular progress SVG lacks a `<title>` or `aria-label`, meaning screen readers will only read the raw text ("50% CICLO").

---

## Performance Considerations
- Re-render triggers: Re-renders whenever the `subject` object reference changes or drag state changes.
- Expensive operations: The fallback mapping from `subject.topics` to `effectiveThemes` creates new arrays on every render if `themes` is not provided.
- Memoization: None. Wrapping with `React.memo` could prevent re-renders in long lists during drag-and-drop operations.

---

## Usage Examples

**Basic usage:**
```tsx
<SubjectCard
  subject={subjectData}
  isActive={index === activeSubjectIndex}
  onClick={(id) => navigateToDetail(id)}
  onPlay={(id) => startTimer(id)}
/>
```

**Usage with Drag and Drop:**
```tsx
<SubjectCard
  subject={subjectData}
  isActive={false}
  draggable={true}
  isEditMode={true}
  isDragging={draggedIndex === index}
  isDropTarget={dropTargetIndex === index}
  onDragStart={() => handleDragStart(index)}
  onDragEnter={() => handleDragEnter(index)}
  onDragEnd={handleDragEnd}
/>
```

---

## Anti-patterns

**ANTI-PATTERN 1 — Passing new object references for `cycleState` on every render**
Problem: The parent component computes `cycleState` inline: `<SubjectCard cycleState={{...}} />`
Why it breaks: Causes unnecessary re-renders of the card, breaking drag-and-drop performance.
Correct approach: Memoize the computed state or rely on the internal fallback logic by just passing the `subject` prop.

---

## Integration Points
- Parent must provide: A valid `Subject` object.
- Layout requirements: The card expects to be placed in a flex or grid container. It takes `w-full` of its parent.

---

## Known Issues

**ISSUE-001 — Legacy Fallback Performance**
Severity: Low
Description: The component maps `subject.topics` to `effectiveThemes` on every render if the `themes` prop is missing.
Trigger: Using the component with only the legacy `subject` prop.
Impact: Minor performance hit in long lists.
Workaround: Pass the `themes` prop explicitly.
Fix: Complete T-001 (Data Model Unification) and remove the legacy fallback logic entirely.
Status: Not yet fixed.

---

## Changelog
- Initial: Created as the primary display for subjects in the CycleView.
- Update: Added drag-and-drop support and `isEditMode`.
- Update: Added support for the new `Theme` and `SubjectCycleState` data models alongside legacy fallbacks.

---

## Card Anatomy

```text
┌─ left border (8px, subject color) ──────────────────┐
│ [TOP SECTION]                          [badge/status] │
│ MATÉRIA 1                                             │
│ Direito Constitucional                                │
├───────────────────────────────────────────────────────┤
│ [PROGRESS SECTION]                                    │
│ Conteúdo                           12/24              │
│ [████████████████░░░░░░░░] progress bar               │
│                                                       │
│                                      ╭───╮            │
│                                      │50%│            │
│                                      ╰───╯            │
│                                      CICLO            │
│                                      60 min           │
└───────────────────────────────────────────────────────┘
```

## State Visual Specifications

| Property | Active (State 1) | Completed (State 2) | Pending (State 3) | Archived (State 4) |
|----------|------------------|---------------------|-------------------|--------------------|
| background | `bg-white` | `bg-white` | `bg-white` | `bg-white` |
| border | `ring-1 ring-slate-200` | `border-slate-100` | `border-slate-100` | `border-slate-100` |
| left-border | `border-l-[8px]` | `border-l-[8px]` | `border-l-[8px]` | `border-l-[8px]` |
| box-shadow | `shadow-lg` | `shadow-sm` | `shadow-sm` | `shadow-sm` |
| opacity | `opacity-100` | `opacity-100` | `opacity-100` | `opacity-60 grayscale` |
| badge | Play Button | Green Checkmark | None | None |
| transform | `scale-[1.01]` | `scale-100` | `hover:scale-[1.01]` | `scale-100` |
