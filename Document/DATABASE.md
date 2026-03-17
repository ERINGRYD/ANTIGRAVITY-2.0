# Database and Data Layer

> **Storage mechanism:** localStorage (Browser-based Key-Value Store)  
> **Schema version:** Unversioned  
> **Last updated:** 2026-03-17

---

## 1. Storage Overview

### Storage Locations

| Location | Type | Scope | Persistence | Used for |
|----------|------|-------|-------------|---------|
| localStorage | Key-Value | Browser | Forever | All core domain data (Subjects, History, Stats, Questions) |
| React state | In-memory | Session | None | Transient UI state, active timers, active battle state |

### Storage Architecture Diagram
```text
[UI Layer]
    ↕ React state (transient)
[Business Logic Layer]
    ↕ AppContext / Custom Hooks (usePersistedState, useLocalStorage)
[Storage Layer]
    ├── localStorage
    │     ├── 'subjects' → Subject[]
    │     ├── 'studyHistory' → StudySession[]
    │     ├── 'userStats' → UserStats
    │     ├── 'pomodoroSettings' → PomodoroSettings
    │     ├── 'goals' → Goal[]
    │     ├── 'archived_enemies' → ArchivedEnemy[]
    │     └── 'questions' → Question[]
```

### Persistence Philosophy
The application relies entirely on client-side `localStorage` for data persistence. There is no backend database. Data is read into memory (React Context) on application load, mutated in memory, and serialized back to JSON strings in `localStorage` upon every state change. Computed values (like cycle completion percentages or memory stability decay) are calculated on-the-fly during rendering and are strictly kept out of the persistent storage to prevent state desynchronization.

---

## 2. Entity Catalog

### ENTITY: Subject (Legacy)
**Storage location:** localStorage key `subjects`  
**Persistence:** Permanent  
**Status:** ⚠️ In Migration (Parallel Model)  
**Defined in:** `src/types.ts`

#### Schema
```typescript
interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  studiedMinutes: number;
  totalMinutes: number;
  topics: Topic[];
}
```

#### Field Specifications
| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | string | Yes | uuid | Unique | Primary identifier |
| name | string | Yes | — | — | Display name |
| shortName | string | Yes | — | — | Used for DonutChart labels |
| color | string | Yes | — | Hex code | UI accent color |
| studiedMinutes | number | Yes | 0 | >= 0 | Accumulated study time |
| totalMinutes | number | Yes | — | > 0 | Target goal time for the cycle |
| topics | Topic[] | Yes | [] | — | Embedded array of child topics |

#### Relationships
```text
Subject
  └── has many: Topic[] (embedded in topics[])
```

---

### ENTITY: Topic (Legacy)
**Storage location:** localStorage key `subjects` (Embedded)  
**Persistence:** Permanent  
**Status:** ⚠️ In Migration (Parallel Model)  
**Defined in:** `src/types.ts`

#### Schema
```typescript
interface Topic {
  id: string;
  name: string;
  isCompleted: boolean;
  icon: string;
  studiedMinutes: number;
  totalMinutes: number;
  totalQuestions: number;
  completedQuestions: number;
  subTopics?: SubTopic[];
  subItems?: string[];
}
```

#### Relationships
```text
Topic
  ├── belongs to: Subject (implicitly via embedding)
  └── has many: SubTopic[] (embedded in subTopics[])
```

---

### ENTITY: Theme (New Model)
**Storage location:** React state only (Not yet persisted)  
**Persistence:** Computed / Transient  
**Status:** ⚠️ In Migration (Parallel Model)  
**Defined in:** `src/types/theme.types.ts`

#### Schema
```typescript
interface Theme {
  id: string;
  subjectId: string;
  name: string;
  accumulatedTime: number;
  isCompleted: boolean;
  completionSource: 'checklist' | 'manual-known' | 'manual-study' | 'questions' | null;
  subtopics: Subtopic[];
}
```

#### Lifecycle
Created when: Mapped from legacy `Topic` via adapter.  
Updated when: Timer increments `accumulatedTime`.  
Deleted when: Parent subject is deleted.  

---

### ENTITY: SubjectCycleState (New Model)
**Storage location:** React state only (Not yet persisted)  
**Persistence:** Per-rotation  
**Status:** ⚠️ In Migration  
**Defined in:** `src/types/subjectCycle.types.ts`

#### Schema
```typescript
interface SubjectCycleState {
  subjectId: string;
  rotationIndex: number;
  cycleGoalTime: number;
  currentCycleTime: number;
  excessTime: number;
  activeThemeId: string | null;
  isRotationCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
}
```

#### Computed Fields
| Field | Formula | Derived from |
|-------|---------|-------------|
| cycleTimeRemaining | `Math.max(0, cycleGoalTime - currentCycleTime)` | `SubjectCycleState` |
| cycleProgressPercentage | `(currentCycleTime / cycleGoalTime) * 100` | `SubjectCycleState` |

---

### ENTITY: StudySession
**Storage location:** localStorage key `studyHistory`  
**Persistence:** Permanent  
**Status:** Active  
**Defined in:** `src/types/storage.types.ts`

#### Schema
```typescript
interface StudySession {
  id: string;
  date: string;
  subjectId: string;
  subjectName: string;
  topicName: string; 
  minutesStudied: number;
  questionsCompleted: number;
  accuracy: number;
  type: 'foco' | 'batalha' | 'revisao';
  xpEarned: number;
  topicsCompleted?: string[];
  pagesRead?: number;
  pauseMinutes?: number;
  stopPoint?: string;
  confidenceStats?: { certeza: number; duvida: number; chute: number; };
  errorReasons?: Record<string, number>;
  attempts?: QuestionAttempt[];
}
```

#### Lifecycle
Created when: User finishes a Focus Timer or Battle Session.  
Updated when: Never (append-only log).  
Deleted when: Never deleted.  

---

### ENTITY: QuestionAttempt
**Storage location:** localStorage key `studyHistory` (Embedded in `StudySession.attempts`)  
**Persistence:** Permanent  
**Status:** Active  
**Defined in:** `src/types/storage.types.ts`

#### Schema
```typescript
interface QuestionAttempt {
  id: string;
  topicId: string;
  subjectId: string;
  isCorrect: boolean;
  confidence: 'certain' | 'doubtful' | 'guess';
  errorType: 'content' | 'interpretation' | 'distraction' | null;
  timeSpentSeconds: number;
  xpEarned: number;
  attemptedAt: string;
}
```

---

### ENTITY: ArchivedEnemy
**Storage location:** localStorage key `archived_enemies`  
**Persistence:** Permanent  
**Status:** Active  
**Defined in:** `src/utils/ebbinghaus.ts` (implied)

#### Schema
```typescript
interface ArchivedEnemy {
  id: string;
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  originalVictoryDate: string;
  lastVictoryDate: string;
  lastVictoryXp: number;
  returnCount: number;
  currentInterval: number;
  nextReturnDate: string;
  memoryStability: number;
  baseQuestions: number;
  currentDifficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  contestDate?: string;
  totalQuestionsAvailable: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Computed Fields
| Field | Formula | Derived from |
|-------|---------|-------------|
| daysSinceVictory | `now - lastVictoryDate` | `lastVictoryDate` |
| barValue | `(1 - e^(-daysSinceVictory / memoryStability)) * 100` | `daysSinceVictory`, `memoryStability` |

---

### ENTITY: UserStats
**Storage location:** localStorage key `userStats`  
**Persistence:** Permanent  
**Status:** Active  
**Defined in:** `src/types/storage.types.ts`

#### Schema
```typescript
interface UserStats {
  xp: number;
  level: number;
  dailyStreak: number;
  lastStudyDate: string | null;
  unlockedAchievements: string[];
  hp: number;
  stamina: number;
}
```

---

## 3. Schema Relationships

### Entity Relationship Diagram (ASCII)
```text
[Subject] 1 ──── N [Topic] 1 ──── N [SubTopic]
   │                 │
   │                 └── 1 ──── 0..1 [ArchivedEnemy]
   │
   └──── 1 ──── N [StudySession] 1 ──── N [QuestionAttempt]
                                              │
[Question] 1 ─────────────────────────────────┘
```

### Relationship Rules

**Subject → Topic (1:N, embedded)**
- Topics are embedded in `Subject.topics[]`.
- Deleting a Subject cascades and deletes all its Topics.
- No separate storage key for Topics.

**Topic → ArchivedEnemy (1:0..1)**
- A Topic can have at most one `ArchivedEnemy` record.
- `topicId` acts as a unique foreign key in the `archived_enemies` array.
- If a Topic is deleted, its `ArchivedEnemy` becomes an orphan (Known Issue: no cleanup mechanism).

**StudySession → QuestionAttempt (1:N, embedded)**
- Attempts are stored inside the session record.
- To calculate global topic stats, the system must map-reduce across all sessions and all attempts.

### Parallel Model Problem

```text
⚠️ PARALLEL MODELS: Subject/Topic vs Theme/SubjectCycleState

Legacy model (types.ts):
  Subject { topics: Topic[] }
  Topic { studiedMinutes, isCompleted: boolean }
  Storage: localStorage 'subjects'

New model (theme.types.ts & subjectCycle.types.ts):
  Theme { accumulatedTime, isCompleted }
  SubjectCycleState { currentCycleTime, excessTime }
  Storage: React state only (Not persisted)

CURRENT SOURCE OF TRUTH: Legacy model ('subjects' in localStorage).
MIGRATION STATUS: Hooks written, but not integrated into UI or persistence layer.
RISK: New timer hooks operate on transient state. If the app reloads, cycle state is lost until the migration is complete and a new storage key (e.g., 'cycle_state') is implemented.
```

---

## 4. Storage Keys Reference

| Key | Value Type | Set by | Read by | Reset when |
|-----|-----------|--------|---------|------------|
| `subjects` | `Subject[]` | `AppContext` | `AppContext` | Never |
| `studyHistory` | `StudySession[]` | `AppContext` | `AppContext` | Never |
| `userStats` | `UserStats` | `AppContext` | `AppContext` | Never |
| `pomodoroSettings` | `PomodoroSettings` | `AppContext` | `AppContext` | Never |
| `goals` | `Goal[]` | `AppContext` | `AppContext` | Never |
| `archived_enemies` | `ArchivedEnemy[]` | `ebbinghaus.ts` | `ebbinghaus.ts` | Never |
| `questions` | `Question[]` | `QuestionManagerView` | `BattleView` | Never |

### Key Naming Conventions
Keys use a mix of `camelCase` (e.g., `studyHistory`) and `snake_case` (e.g., `archived_enemies`). This is inconsistent but functional.

### Storage Size Considerations
```text
Unbounded growth risk:
- 'studyHistory': Grows with every focus session and battle. Contains embedded 'QuestionAttempt' arrays.
- 'questions': User-generated content. Storing thousands of questions with long text/explanations will bloat localStorage.

Estimated sizes:
- StudySession (with 20 attempts): ~2KB
- At 5 sessions/day: ~3.6MB/year.
- Risk of hitting 5MB localStorage limit within 1-2 years of heavy daily usage.
```

---

## 5. Data Access Patterns

### Read Operations

```text
usePersistedState(key, initialValue) → [state, setState]
  File: src/hooks/usePersistedState.ts
  Storage: localStorage (generic)
  Sync/Async: Synchronous (on mount)
  Error handling: try/catch → returns initialValue on parse failure.
  Called by: AppContext for all core data.

getArchivedEnemies() → ArchivedEnemy[]
  File: src/utils/ebbinghaus.ts
  Storage: localStorage 'archived_enemies'
  Sync/Async: Synchronous
  Error handling: try/catch → returns [] on parse failure.
```

### Write Operations

```text
setState(value) (via usePersistedState)
  File: src/hooks/usePersistedState.ts
  Storage: localStorage (generic)
  Sync/Async: Synchronous
  Operation: Overwrites entire JSON string for the key.
  Atomicity: Not atomic across multiple keys.

saveArchivedEnemy(enemy) → void
  File: src/utils/ebbinghaus.ts
  Storage: localStorage 'archived_enemies'
  Sync/Async: Synchronous
  Operation: Read array, filter out existing by topicId, push new, write array.
```

### Delete Operations

```text
removeEnemyFromArchive(topicId) → void
  File: src/utils/ebbinghaus.ts
  Storage: localStorage 'archived_enemies'
  Operation: Read array, filter out topicId, write array.
  Cascade: None.
```

---

## 6. SQL Schema

**Not Applicable.** 
The application relies entirely on `localStorage` document-style JSON storage. No relational database (SQLite/IndexedDB) is currently implemented.

---

## 7. Data Integrity Rules

```text
INTEGRITY-001 — studiedMinutes ceiling
Rule: Subject.studiedMinutes must never exceed Subject.totalMinutes in the legacy model.
Enforced by: UI logic capping the progress bar, but NOT enforced strictly at the data mutation layer.
Risk if violated: Progress calculations return > 100%, breaking UI rendering.

INTEGRITY-002 — ArchivedEnemy uniqueness
Rule: Only one ArchivedEnemy record per topicId.
Enforced by: Read-modify-write pattern in saveArchivedEnemy() which filters out existing records before pushing.
Risk if violated: Duplicate enemies appear in the Vencidos page.

INTEGRITY-003 — Weighted score range
Rule: weightedScore must always be between 0 and 100.
Enforced by: Math.max(0, Math.min(100, score)) in calculateWeightedScore().
Risk if violated: Room classification breaks.

INTEGRITY-004 — XP Non-Negative
Rule: UserStats.xp must never drop below 0.
Enforced by: addXP() function in AppContext.
Risk if violated: Level calculation yields negative or NaN levels.
```

---

## 8. Data Migration Strategy

### Current migration needs

```text
MIGRATION-001 — Legacy Subject → Theme / SubjectCycleState model
Status: Not started
Trigger: When new hooks (useStudyTimer) are fully integrated into FocusModeView.
Steps:
  1. Introduce new localStorage keys: 'themes' and 'cycle_states'.
  2. On app boot, check if 'themes' is empty but 'subjects' is populated.
  3. Map Subject.topics → Theme records. Map Topic.studiedMinutes → Theme.accumulatedTime.
  4. Initialize SubjectCycleState for each subject based on Subject.studiedMinutes.
  5. Write to new keys. Do NOT delete 'subjects' until v2.0 to allow rollback.
Risk: Data loss or desynchronization if the user interrupts the migration.
Mitigation: Perform migration synchronously before rendering the React tree.
```

### Migration principles
1. Never delete old data keys until the migration is verified in production.
2. Migrations must be idempotent (safe to run multiple times).
3. Fallback to default values if legacy data is missing expected fields.

---

## 9. Known Data Issues

```text
ISSUE-001 — No schema versioning
Severity: High
Location: All localStorage operations
Problem: No version number is stored with persisted data.
Impact: Cannot safely run future schema migrations because there is no way to programmatically determine what version of the data structure the user currently has in their browser.
Fix: Add a `schema_version` key to localStorage on app init.

ISSUE-002 — Unbounded studyHistory growth
Severity: Medium
Location: localStorage 'studyHistory'
Problem: Every study session and battle attempt is appended to a single massive array.
Impact: `JSON.stringify` and `JSON.parse` will become performance bottlenecks, and the 5MB localStorage limit will eventually be hit.
Fix: Implement an archival strategy (e.g., aggregate old sessions into monthly summaries) or migrate to IndexedDB.

ISSUE-003 — Orphaned Archived Enemies
Severity: Low
Location: localStorage 'archived_enemies'
Problem: If a user deletes a Subject or Topic, the corresponding `ArchivedEnemy` is not deleted.
Impact: Wasted storage space; potential UI crashes if the app tries to render an enemy whose parent topic no longer exists.
Fix: Implement cascading deletes in the `deleteSubject` and `deleteTopic` functions.

ISSUE-004 — Non-atomic read-modify-write operations
Severity: Low (Single-threaded environment)
Location: saveArchivedEnemy()
Problem: Reading the array, modifying it, and writing it back are separate operations.
Impact: In a synchronous browser environment, this is generally safe, but if async operations are introduced later, it could lead to race conditions and data loss.
```

---

## 10. Data Flow Diagrams

### Study Session End Flow
```text
[FocusModeView / BattleView]
        ↓ (User clicks Finish)
Session object created (in memory)
        ↓
addStudySession(session) called in AppContext
        ↓
Reads 'studyHistory' from localStorage
        ↓
Appends new session to array
        ↓
Writes updated array to 'studyHistory'
        ↓
[IF Battle Session]
        ↓
Extract QuestionAttempts
        ↓
calculateWeightedScore() → determine Room
        ↓
[IF Room === 'Vencidos'] → saveArchivedEnemy() → writes to 'archived_enemies'
```

### Forgetting Curve Calculation Flow
```text
[VencidosPage Mounts]
        ↓
getArchivedEnemies() reads 'archived_enemies' from localStorage
        ↓
[Render Loop]
For each enemy:
  daysSinceVictory = now - enemy.lastVictoryDate
  barValue = calculateBarValue(daysSinceVictory, enemy.memoryStability)
  (Computed entirely in memory, NOT persisted)
        ↓
[IF barValue >= 100 OR now >= nextReturnDate]
  Enemy visually flagged as "Ready for Battle" (Alerta)
```

---

## Data Layer Gaps

### Missing persistence
- **`Theme` and `SubjectCycleState`:** The new data models introduced for the timer refactor exist only as TypeScript interfaces and logic in custom hooks. There is currently no mechanism to persist them to `localStorage`.

### Missing indexes or optimization
- **Historical Attempts Querying:** To calculate stats for a specific topic, the app must deserialize the entire `studyHistory` array, iterate through every session, and filter the embedded `attempts` array. This is an O(N) operation that will degrade performance as history grows. An index mapping `topicId -> attemptIds` would solve this, but requires moving to IndexedDB.

### Schema questions
- **Question Bank Storage:** Questions are currently stored in `localStorage`. If the app intends to provide a pre-built database of thousands of questions for "concursos", `localStorage` will fail immediately. Is the plan to ship a pre-populated SQLite database (via `sql.js`) or fetch questions from a remote API? This architectural decision is missing.
