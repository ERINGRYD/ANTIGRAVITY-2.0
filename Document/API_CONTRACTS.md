# API Contracts

> **Purpose:** Interface contracts between all internal modules  
> **Scope:** Component props, hooks, utilities, storage, callbacks  
> **Last updated:** 2026-03-17
>
> **How to use this document:**  
> Before implementing any module, find its contract here.  
> Before calling any function, verify the input/output contract.  
> Before modifying any interface, update this document first.

---

## Contract Notation
```typescript
// Required prop
propName: Type

// Optional prop with default
propName?: Type  // default: [value]

// Callback — called when [condition]
onEvent: (param: Type) => ReturnType

// Pure function — no side effects
// [PURE] marker indicates no side effects guaranteed
function name(input: Type): Output  // [PURE]

// Async function
async function name(input: Type): Promise<Output>

// Invariant — must always be true
// @invariant description

// Side effect — document what changes outside the function
// @sideeffect localStorage key 'name' is written
// @sideeffect React state X is updated
```

---

## 1. Component Contracts

---

### CC-001 — BattleQuestionView

**File:** `src/components/BattleQuestionView.tsx`  
**Category:** Presentational / Interactive  
**Purpose:** Renders a single battle question, handles user selection of answer and confidence, and reports the result.

#### Props Contract
```typescript
interface BattleQuestionViewProps {
  // Required props
  question: Question      // The question entity to render
  mode: 'laboratorio' | 'arena-elite' // The active battle mode
  
  // Callback props
  onAnswerConfirmed: (attempt: QuestionAttempt) => void
  onTimeUp?: () => void   // Required if mode === 'arena-elite'
}
```

#### Prop Specifications

| Prop | Type | Required | Default | Description | Constraints |
|------|------|----------|---------|-------------|-------------|
| question | Question | Yes | — | The question data | Must contain at least 2 options |
| mode | string | Yes | — | Battle ruleset | 'laboratorio' or 'arena-elite' |
| onAnswerConfirmed | function | Yes | — | Triggered on submit | — |
| onTimeUp | function | No | undefined | Triggered on timeout | Must be provided for arena-elite |

#### Callback Contracts

**onAnswerConfirmed(attempt: QuestionAttempt)**
- Called when: The user has selected BOTH an answer option and a confidence level, and clicks the "Confirmar" button.
- Arguments: `attempt` — A fully formed `QuestionAttempt` object containing correctness, confidence, and time spent.
- Caller expectation: The parent component will process the attempt, update HP/XP, and advance to the next question or show the results screen.
- Must NOT: The callback must not mutate the `attempt` object passed to it.

**onTimeUp()**
- Called when: `mode === 'arena-elite'` AND the 45-second internal countdown reaches 0 before the user confirms an answer.
- Arguments: none.
- Caller expectation: The parent component will register a failure (Wrong + Guess), deduct a life, and end the Arena Elite session.

#### Output Contract

What the component guarantees to render:
- `mode === 'arena-elite'` → renders a strict 45-second countdown timer.
- `mode === 'laboratorio'` → renders no timer.
- When an option is selected but confidence is not → "Confirmar" button remains disabled.

#### Invariants
```text
@invariant The "Confirmar" button is strictly disabled until both `selectedOptionId` and `selectedConfidence` are non-null.
@invariant If `mode === 'arena-elite'`, the component will automatically trigger `onTimeUp` at 45 seconds.
```

---

### CC-002 — CycleProgressBar

**File:** `src/components/CycleProgressBar.tsx`  
**Category:** Presentational  
**Purpose:** Renders a visual progress bar for a subject's cycle goal.

#### Props Contract
```typescript
interface CycleProgressBarProps {
  progress: number
  color: string
  label?: string
}
```

#### Invariants
```text
@invariant The rendered fill width is strictly clamped between 0% and 100%, even if `progress` > 100.
```

---

## 2. Hook Contracts

### HC-001 — useStudyTimer

**File:** `src/hooks/useStudyTimer.ts`  
**Purpose:** Manages dual-counter study time (cycle time vs accumulated time) independently of UI rendering.
**Status:** Active (but partially integrated)

#### Input Contract
```typescript
interface UseStudyTimerProps {
  subjectId: string
  cycleGoalTime: number      // in minutes
  initialCycleTime?: number  // default: 0
  
  onCycleGoalReached: () => void 
}
```

#### Output Contract
```typescript
interface UseStudyTimerReturn {
  // State values
  isRunning: boolean
  currentCycleTimeSeconds: number
  excessTimeSeconds: number
  isGoalReached: boolean
  
  // Actions
  start: () => void
  pause: () => void
  stop: () => void
}
```

#### Behavioral Contract

**Initialization:**
Initializes `currentCycleTimeSeconds` to `initialCycleTime * 60`. `excessTimeSeconds` starts at 0.

**Side effects:**
```text
@sideeffect Updates internal React state every 1000ms using `setInterval` when `isRunning` is true.
```

**Cleanup:**
Clears the internal `setInterval` on unmount or when paused/stopped.

**Constraints:**
```text
@invariant `currentCycleTimeSeconds` never exceeds `cycleGoalTime * 60`.
@invariant Once `currentCycleTimeSeconds` reaches the goal, all subsequent ticks increment `excessTimeSeconds`.
```

#### Callback Timing Contract

**onCycleGoalReached():**
- Called: exactly once per session when `currentCycleTimeSeconds` strictly equals `cycleGoalTime * 60`.
- Never called: again after the first call, even if the timer continues running into excess time.
- Guaranteed: called synchronously during the tick that reaches the goal.

---

### HC-002 — usePersistedState

**File:** `src/hooks/usePersistedState.ts`  
**Purpose:** Synchronizes React state with `localStorage`.

#### Input Contract
```typescript
function usePersistedState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void]
```

#### Behavioral Contract
```text
@sideeffect Writes to `localStorage[key]` synchronously every time the setter is called.
@invariant If `localStorage[key]` contains invalid JSON, it falls back to `initialValue` and does not throw.
```

---

## 3. Utility Function Contracts

### Scoring Functions (`src/utils/confidenceScoring.ts`)

```typescript
// [PURE] Calculates confidence-weighted score 0-100
// Returns 0 for empty array
// Clamps result to [0, 100] — never returns negative or > 100
export function calculateWeightedScore(attempts: QuestionAttempt[]): number

// [PURE] Classifies enemy room from weighted score
// questionsAnswered=0 always returns 'reconhecimento'
// regardless of weightedScore value
export function classifyEnemyRoom(
  weightedScore: number,     // 0-100
  questionsAnswered: number  // >= 0
): 'reconhecimento' | 'critica' | 'alerta' | 'vencidos'

// [PURE] Returns weight for a single attempt combination
// Returns 0 for unknown combinations (never throws)
export function getAttemptWeight(
  isCorrect: boolean,
  confidence: 'certain' | 'doubtful' | 'guess'
): number  // one of: 1.0, 0.6, 0.2, -0.5, 0.0, 0.1
```

### Ebbinghaus Functions (`src/utils/ebbinghaus.ts`)

```typescript
// [PURE] Calculates memory retention 0-1
// Returns 1.0 when daysSinceVictory=0
// Approaches 0 as daysSinceVictory increases
// Never returns negative
export function calculateRetention(
  daysSinceVictory: number,  // >= 0
  memoryStability: number    // S value, typically 4-20
): number  // range: (0, 1]

// [PURE] Calculates forgetting bar value 0-100
// Returns 0 when daysSinceVictory=0
// Returns 100 when fully forgotten
export function calculateBarValue(
  daysSinceVictory: number,
  memoryStability: number
): number  // range: [0, 100]

// [PURE] Estimates memory stability from accuracy and weighted score
// Higher accuracy/score → higher S → slower forgetting
export function estimateMemoryStabilityWithConfidence(
  accuracyRate: number, 
  weightedScore: number
): number
// Combined >= 80 → 20 | >= 65 → 12 | >= 45 → 7 | < 45 → 4
```

---

## 4. Context Contracts

### XC-001 — AppContext

**File:** `src/contexts/AppContext.tsx`  
**Purpose:** Provides global access to user data, study history, and core mutation functions.

#### Value Contract
```typescript
interface AppContextType {
  // State values provided
  subjects: Subject[]
  studyHistory: StudySession[]
  userStats: UserStats
  
  // Actions provided
  addStudySession: (session: StudySession) => void
  addXP: (amount: number) => void
  updateSubject: (subject: Subject) => void
  deleteSubject: (id: string) => void
}
```

#### Consumer Contract
```typescript
// How to consume safely:
export function useAppContext(): AppContextType {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppContextProvider')
  return context
}
```

#### Persistence Contract
- What is persisted: `subjects`, `studyHistory`, `userStats`, `pomodoroSettings`.
- Persistence mechanism: `localStorage` via `usePersistedState`.
- Initial value on first load: Empty arrays/defaults defined in `constants.tsx`.

---

## 5. Storage Contracts

### SC-001 — localStorage key 'archived_enemies'

**Written by:** `saveArchivedEnemy`, `removeEnemyFromArchive`  
**Read by:** `getArchivedEnemies`  
**Type:** `ArchivedEnemy[]`

#### Write Contract
```typescript
// Written when: A topic's weighted score reaches >= 75 after a battle.
// Overwrites previous value: Read-modify-write (filters out existing topicId, pushes new, writes array).
// Atomic: No.
```

#### Read Contract
```typescript
// Parse strategy:
const value: ArchivedEnemy[] = raw ? JSON.parse(raw) : []

// On parse failure: returns [] — never throws.
// On missing key: returns [].
```

#### Corruption Contract
- If value is malformed JSON: returns `[]`.
- If value has wrong shape: No runtime validation is performed. Components mapping over the array may crash if expected fields (e.g., `topicId`) are missing.

---

## 6. Callback Contracts

### CBC-001 — onArchiveEnemy (Implicit in Battle End)

**Type:** `(topicId: string, weightedScore: number) => void`  
**Defined in:** `src/components/BattleView.tsx` (Session End Logic)  

#### Contract
**Called when:**
- The battle session ends (all questions answered or Arena Elite failed).
- AND the newly calculated `weightedScore` for the topic is `>= 75`.

**Arguments:**
- `topicId: string` — ID of the defeated topic.
- `weightedScore: number` — The calculated score (0-100).

**Caller expectation:**
- The system will write the topic to the `archived_enemies` storage.
- The topic will be removed from the active "Crítica" or "Reconhecimento" rooms.

**Must NOT:**
- Must not be called if `weightedScore < 75`.

**Side effects:**
```text
@sideeffect localStorage 'archived_enemies' is written.
@sideeffect UI state invalidated for Vencidos page.
```

---

## 7. Data Transformation Contracts

### DT-001 — subjectToTheme adapter

**File:** `src/adapters/subjectToTheme.ts` (Planned/Stubbed)  
**Purpose:** Bridge between legacy Subject model and new Theme model.  
**Status:** Temporary — will be removed when migration is complete.

#### topicToTheme()
```typescript
// [PURE] Converts a legacy Topic to a new Theme
function topicToTheme(topic: Topic, subjectId: string): Theme

// Transformation rules:
// topic.id → theme.id
// topic.name → theme.name
// topic.studiedMinutes → theme.accumulatedTime
// topic.isCompleted ? 'checklist' : null → theme.completionSource
```

#### subjectToCycleState()
```typescript
// [PURE] Creates a SubjectCycleState from a legacy Subject
function subjectToCycleState(subject: Subject): SubjectCycleState

// Transformation rules:
// Math.min(subject.studiedMinutes, subject.totalMinutes) → currentCycleTime
// Math.max(0, subject.studiedMinutes - subject.totalMinutes) → excessTime
// subject.studiedMinutes >= subject.totalMinutes → isRotationCompleted
```

---

## 8. Contract Violations and Error Catalog

### VIOLATION-001 — AppContext `as any` cast
- **Contract violated:** `AppContext.Provider` value prop contract.
- **Location:** `src/contexts/AppContext.tsx` (Common in initial React setups).
- **Type:** Type safety contract violation.
- **Impact:** TypeScript cannot detect interface mismatches at compile time if the default context value is cast to `any`.
- **Status:** Needs verification/fix.

### VIOLATION-002 — Orphaned Archived Enemies
- **Contract violated:** Data Integrity / Storage Contract.
- **Location:** `AppContext.tsx` (`deleteTopic` / `deleteSubject`).
- **Type:** Missing side-effect contract.
- **Impact:** Deleting a subject does not trigger the callback to remove its associated `archived_enemies`.
- **Status:** Tracked in SPRINT_ATUAL.md (T-005).

---

## 9. Contract Change Protocol

### Before changing a contract:

1. Find every caller of the interface being changed (search codebase for all usages).
2. Assess breaking vs non-breaking:
   **BREAKING changes (require all callers to update):**
   - Removing a required prop/parameter.
   - Changing a parameter's type.
   - Changing a return type.
   - Changing when a callback is called.
   - Changing what side effects occur.

   **NON-BREAKING changes (callers continue to work):**
   - Adding an optional prop with a default.
   - Expanding a union type (adding a new option).
   - Making a required prop optional (with sensible default).

3. For **BREAKING** changes:
   - Update all callers simultaneously.
   - Update this document BEFORE implementing.
   - Add entry to CHANGELOG.md.

4. For **NON-BREAKING** changes:
   - Update this document AFTER implementing.
   - Add entry to CHANGELOG.md.

### Never:
- Change a contract without updating this document.
- Remove a prop that callers depend on without updating callers.
- Change callback timing without auditing all callers.

---

## Document Maintenance Rules

Update this file when:
- Any component's props interface changes.
- Any hook's input or output changes.
- Any utility function's signature changes.
- Any localStorage key's value shape changes.
- Any callback's invocation condition changes.
- A new contract violation is discovered or fixed.

Update BEFORE implementing breaking changes.
Update AFTER implementing non-breaking changes.

A contract document that is out of date is worse than no contract document — it actively misleads implementers.

---

## Undocumented Interfaces

List any interface boundary found in the codebase that could not be fully documented from code analysis alone:

### Unclear callback behavior
- **`onAchievementUnlocked`**: The exact triggering condition for achievements is ambiguous. It is unclear if this should be a global event emitter, a context callback, or evaluated purely inside `addStudySession`. Needs clarification.

### Missing type definitions
- **`errorReasons` in `StudySession`**: The structure `Record<string, number>` is used, but the exact string keys (e.g., 'content', 'interpretation') are not strictly typed as a union in the `StudySession` interface, leading to potential typos when reading/writing error stats. Needs proper typing before the contract can be fully documented.
