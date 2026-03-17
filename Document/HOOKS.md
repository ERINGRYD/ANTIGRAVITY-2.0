# Custom Hooks

> **Total hooks documented:** 4  
> **Last updated:** 2026-03-17
>
> **Quick reference:**
> | Hook | Purpose | Status | Complexity |
> |------|---------|--------|------------|
> | `useStudyTimer` | Dual-counter study session timer | Not yet connected | High |
> | `usePersistedState` | localStorage-backed state | Active | Low |
> | `useAutoCycleTransition` | Auto-advancement countdown | Not yet connected | Medium |
> | `useManualCycleDecision` | Manual cycle advancement prompt | Not yet connected | Medium |

---

## Hook Complexity Guide

- **Low** — Single concern, no external side effects, no intervals.
- **Medium** — Multiple concerns, or external side effects, or cleanup needed.
- **High** — Multiple concerns + external side effects + complex state machine or timing-sensitive behavior.

---

## HK-001 — useStudyTimer

**File:** `src/hooks/useStudyTimer.ts`  
**Purpose:** Manages a dual-counter timer that tracks time towards a cycle goal and excess time independently.  
**Complexity:** High  
**Status:** Not yet connected (Blocked by Data Model Unification)  
**Used by:** Not yet used (Planned for `FocusModeView`)

### Why this hook exists
The legacy timer in `FocusModeView` tracked a single elapsed time value. However, the application's business rules require tracking "Cycle Time" (capped at the subject's goal) and "Excess Time" (time studied beyond the goal) separately. This hook extracts that complex dual-counter logic, interval management, and goal-detection out of the UI component, making the timer testable and resilient to re-renders.

### Interface

#### Input
```typescript
interface UseStudyTimerProps {
  subjectId: string
  // [Description]: The ID of the subject being studied.
  // [Used for]: Resetting the timer when the subject changes.

  cycleGoalTime: number
  // [Description]: The target time for this subject in minutes.
  // [Constraints]: > 0.

  initialCycleTime?: number
  // [Description]: Previously accumulated cycle time in minutes.
  // Default: 0
  // [Used for]: Resuming a partially completed cycle rotation.

  onCycleGoalReached: () => void
  // Called when: currentCycleTimeSeconds exactly reaches cycleGoalTime * 60.
  // Hook behavior if this throws: Error is unhandled; interval may continue but UI might crash.
  // Must be stable: YES (wrap in useCallback).
}
```

#### Output
```typescript
interface UseStudyTimerReturn {
  // State values
  isRunning: boolean
  // [Description]: True if the interval is actively ticking.
  // Initial value: false
  // Changes when: start(), pause(), or reset() are called.

  currentCycleTimeSeconds: number
  // [Description]: Time applied to the cycle goal.
  // Initial value: initialCycleTime * 60
  // Changes when: isRunning is true AND isGoalReached is false.

  excessTimeSeconds: number
  // [Description]: Time studied beyond the cycle goal.
  // Initial value: 0
  // Changes when: isRunning is true AND isGoalReached is true.

  isGoalReached: boolean
  // [Description]: True if currentCycleTimeSeconds >= cycleGoalTime * 60.

  // Action functions
  start: () => void
  // Does: Starts or resumes the timer interval.
  // Safe to call when: isRunning is false.
  
  pause: () => void
  // Does: Clears the timer interval.
  // Safe to call when: isRunning is true.

  reset: () => void
  // Does: Clears the interval and resets all counters to initial values.
}
```

### Internal State Machine

```text
States:
  'idle'       — Timer is at 0 or initial values, not ticking.
  'running'    — Interval is active, seconds are incrementing.
  'paused'     — Interval is cleared, values are frozen.

Transitions:
  idle → running      triggered by: start()
                      side effects: setInterval created.

  running → paused    triggered by: pause()
                      side effects: clearInterval called.

  running → running   triggered by: tick (internal)
                      conditions: currentCycleTimeSeconds reaches goal
                      side effects: onCycleGoalReached() fired ONCE, 
                                    isGoalReached set to true.

  any → idle          triggered by: reset()
                      side effects: clearInterval called, state reset.
```

### Internal Mechanics

**useState declarations**
```typescript
const [isRunning, setIsRunning] = useState(false)
const [currentCycleTimeSeconds, setCurrentCycleTimeSeconds] = useState(initialCycleTime * 60)
const [excessTimeSeconds, setExcessTimeSeconds] = useState(0)
const [isGoalReached, setIsGoalReached] = useState(false)
```

**useRef declarations**
```typescript
// Used because: Storing the interval ID in state would cause unnecessary re-renders.
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

// Used because: We need to call the LATEST onCycleGoalReached without adding it 
// to the interval's dependency array (which would clear/reset the interval constantly).
const onGoalReachedRef = useRef(onCycleGoalReached)
```

**useEffect declarations**
```typescript
// Effect 1 — Keep callback ref fresh
useEffect(() => {
  onGoalReachedRef.current = onCycleGoalReached
}, [onCycleGoalReached])

// Effect 2 — Cleanup on unmount
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])
```

### Timing Diagram

```text
Timeline of a study session with useStudyTimer (Goal = 60s):

t=0s:    start() called
         → isRunning: false → true
         → interval created (1s tick)

t=1s:    1s tick fires
         → currentCycleTimeSeconds: 0 → 1
         → excessTimeSeconds: 0

t=60s:   Goal reached (cycleGoalTime * 60)
         → isGoalReached: false → true
         → onGoalReachedRef.current() called ONCE
         → currentCycleTimeSeconds: 59 → 60

t=61s:   Next tick after goal
         → currentCycleTimeSeconds: FROZEN at 60
         → excessTimeSeconds: 0 → 1

pause(): Any time
         → isRunning: true → false
         → interval cleared, values FROZEN
```

### Usage Guide

**Correct callback memoization**
```typescript
// ✅ CORRECT — stable callback reference
const handleGoalReached = useCallback(() => {
  triggerTransition()
}, [])

const timer = useStudyTimer({ 
  subjectId: '123', 
  cycleGoalTime: 60, 
  onCycleGoalReached: handleGoalReached 
})

// ❌ INCORRECT — new function every render causes useEffect re-runs
const timer = useStudyTimer({ 
  subjectId: '123', 
  cycleGoalTime: 60, 
  onCycleGoalReached: () => triggerTransition() // Bad!
})
```

### Anti-patterns

**ANTI-PATTERN 1 — Relying on state for immediate logic**
- **Problem:** Calling `pause()` and immediately reading `currentCycleTimeSeconds` expecting the absolute latest millisecond value.
- **Why it breaks:** React state updates are asynchronous. The value read immediately after `pause()` might be one tick behind.
- **Correct approach:** Use the values provided in the component's render cycle, or pass the state to a `useEffect` that triggers on `isRunning` changing to `false`.

### Testing Guide
```text
How to test this hook in isolation:
1. Setup: Render hook with initialCycleTime=0, cycleGoalTime=1 (60s).
2. Key scenarios to test:
   - Call start(), advance Jest fake timers by 10s -> verify currentCycleTimeSeconds=10.
   - Advance fake timers by 50s (total 60s) -> verify onCycleGoalReached is called exactly once.
   - Advance fake timers by 10s more -> verify currentCycleTimeSeconds=60, excessTimeSeconds=10.
3. What to mock: jest.useFakeTimers().
```

---

## HK-002 — usePersistedState

**File:** `src/hooks/usePersistedState.ts`  
**Purpose:** Synchronizes a piece of React state with `localStorage`.  
**Complexity:** Low  
**Status:** Active  
**Used by:** `AppContext.tsx`

### Why this hook exists
Reading from and writing to `localStorage` manually in every component creates boilerplate and risks state desynchronization. This hook wraps `useState` with `localStorage` side effects, ensuring that any state mutation is automatically persisted to the browser.

### Interface

#### Input
```typescript
// Generic type T
key: string
// [Description]: The localStorage key.

initialValue: T
// [Description]: The fallback value if the key does not exist or fails to parse.
```

#### Output
```typescript
// Returns a standard useState tuple
[T, React.Dispatch<React.SetStateAction<T>>]
```

### Internal Mechanics

**useState declarations**
```typescript
const [state, setState] = useState<T>(() => {
  // Lazy initialization: only reads from localStorage on the FIRST render.
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue;
  }
})
```

**useEffect declarations**
```typescript
// Effect 1 — Sync to localStorage
// Runs when: `state` or `key` changes.
useEffect(() => {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error(error);
  }
}, [key, state])
```

### Anti-patterns

**ANTI-PATTERN 1 — Storing non-serializable data**
- **Problem:** Passing functions, Maps, Sets, or circular objects to `setState`.
- **Why it breaks:** `JSON.stringify` will strip functions and crash on circular references, causing data loss or app crashes.
- **Correct approach:** Only store plain JSON objects, arrays, strings, numbers, and booleans.

---

## HK-003 — useAutoCycleTransition

**File:** `src/hooks/useAutoCycleTransition.ts`  
**Purpose:** Manages the 10-second countdown phase that occurs when a subject's goal is reached and auto-cycle is enabled.  
**Complexity:** Medium  
**Status:** Not yet connected  

### Interface

#### Input
```typescript
interface UseAutoCycleTransitionProps {
  isGoalReached: boolean
  // [Description]: Triggers the transition phase when true.
  
  onTransitionComplete: () => void
  // Called when: The 10-second countdown reaches 0.
  
  onCancel: () => void
  // Called when: The user explicitly cancels the transition.
}
```

#### Output
```typescript
interface UseAutoCycleTransitionReturn {
  isTransitioning: boolean
  countdown: number
  cancelTransition: () => void
}
```

### Internal State Machine
```text
States:
  'idle'          — isGoalReached is false.
  'transitioning' — isGoalReached is true, countdown > 0.
  'completed'     — countdown hit 0, onTransitionComplete fired.
  'cancelled'     — user clicked cancel, onCancel fired.
```

---

## HK-004 — useManualCycleDecision

**File:** `src/hooks/useManualCycleDecision.ts`  
**Purpose:** Manages the prompt state when a cycle goal is reached and auto-cycle is OFF.  
**Complexity:** Low  
**Status:** Not yet connected  

### Interface

#### Input
```typescript
interface UseManualCycleDecisionProps {
  isGoalReached: boolean
  onDecisionMade: (decision: 'continue' | 'next') => void
}
```

#### Output
```typescript
interface UseManualCycleDecisionReturn {
  isPromptVisible: boolean
  makeDecision: (decision: 'continue' | 'next') => void
}
```

---

## Hook Dependency Map

```text
External Systems:
  localStorage ←──── usePersistedState
                          ↑
                      AppContext
                          ↑
                    [All components]

  setInterval ←──── useStudyTimer
                          ↑
                    FocusModeView [NOT YET CONNECTED]
                          ↑
              useAutoCycleTransition [NOT YET CONNECTED]
              useManualCycleDecision [NOT YET CONNECTED]

Hook dependencies (A uses B):
  (None currently — hooks are highly decoupled)
```

---

## Common Hook Patterns Used in This Codebase

**Pattern 1 — Ref for interval storage**
```typescript
// Used in: useStudyTimer, useAutoCycleTransition
// Why: avoids re-render when interval is created/cleared
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

const clearTimer = useCallback(() => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }
}, [])
```

**Pattern 2 — Ref for latest callback (avoids stale closure)**
```typescript
// Used in: useStudyTimer
// Why: interval closure captures initial callback ref. 
// A ref always points to the latest callback version without triggering effect re-runs.
const callbackRef = useRef(onCallback)
useEffect(() => { callbackRef.current = onCallback }, [onCallback])

// Inside interval: callbackRef.current() instead of onCallback()
```

**Pattern 3 — Lazy State Initialization**
```typescript
// Used in: usePersistedState
// Why: Reading from localStorage is synchronous and slow. 
// Passing a function to useState ensures it only runs on the initial render.
const [state, setState] = useState(() => {
  return localStorage.getItem(key)
})
```

---

## Hooks To Be Created (Planned)

**PLANNED-001 — useBattleSession**
- **Purpose:** Manage the complete lifecycle of a battle session (question loading, answer recording, session end).
- **Replaces:** Inline battle logic currently bloating the `BattleView` component.
- **Depends on:** `QuestionAttempt` model, `processSessionEnd` function.
- **Complexity:** High

**PLANNED-002 — useEnemyReturn**
- **Purpose:** Check and trigger enemy returns from archived state on app launch and page focus.
- **Replaces:** Manual checks in `VencidosPage`.
- **Complexity:** Medium

---

## Document Maintenance Rules

Update this file when:
- A new custom hook is created (add full HK-XXX section).
- An existing hook's interface changes (update Interface section).
- A known issue is discovered or fixed.
- A hook's status changes (e.g., from "Not yet connected" to "Active").

Keep Hook Dependency Map current — an outdated dependency map causes integration mistakes.
Mark hooks as `[NOT YET CONNECTED]` explicitly — do not remove the section just because a hook is unused. Unused hooks with full documentation are an asset.

---

## Hook Review Checklist

Use this checklist when creating or modifying any hook:

### Interface design
- [ ] Props interface is documented with purpose of each field.
- [ ] Return interface is documented with initial values.
- [ ] All callback props document when they are called.
- [ ] All callback props document what the hook expects as result.

### Implementation safety
- [ ] All `useEffect` hooks have correct dependency arrays.
- [ ] No functions in dependency arrays without `useCallback`.
- [ ] All intervals/timeouts cleared on unmount.
- [ ] No direct state mutations — always return new objects.
- [ ] Callbacks called with stable refs (not stale closures).

### Edge cases handled
- [ ] Hook behaves correctly when optional props are undefined.
- [ ] Hook cleans up correctly when unmounted mid-operation.
- [ ] Hook handles callback errors without crashing.
- [ ] Reset function returns hook to exact initial state.

### Documentation complete
- [ ] HK-XXX section added to HOOKS.md.
- [ ] HC-XXX contract added to API_CONTRACTS.md.
- [ ] Hook Dependency Map updated.
