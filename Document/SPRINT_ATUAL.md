# Sprint Atual

> **Sprint:** 7 — Timer Integration & Data Unification  
> **Started:** 2026-03-17  
> **Target end:** 2026-03-31  
> **Focus:** Resolve the dual data model technical debt and integrate the new timer hooks.  
> **Last updated:** 2026-03-22

---

## Sprint Goal

Unify the legacy `Subject/Topic` data model with the new `Theme/SubjectCycleState` model to establish a single source of truth. Successfully integrate the orphaned timer hooks (`useStudyTimer`, `useAutoCycleTransition`) into the `FocusModeView` so users have accurate dual-counter tracking (cycle time vs. excess accumulated time). Additionally, implement a manual data export feature to secure user data against `localStorage` wipes.

---

## Status Board

| ID | Task | Status | Assignee | Blocked by |
|----|------|--------|----------|------------|
| T-001 | Unify Data Models (Subject -> Theme) | 🔄 In Progress | — | — |
| T-002 | Integrate useStudyTimer into FocusModeView | ❌ Blocked | — | T-001 |
| T-003 | Implement Data Export/Backup | 📋 Ready | — | — |
| T-004 | Wire up Achievement Triggers | 📋 Ready | — | — |
| T-005 | Fix Orphaned Archived Enemies | 📋 Ready | — | — |

Status legend:
🔄 In Progress — actively being worked on
✅ Done — complete and verified
📋 Ready — defined and ready to start, not started yet
❌ Blocked — cannot proceed, waiting on dependency
🔍 In Review — built, needs verification or integration test
⏸️ Deferred — moved out of this sprint

---

## 🔄 In Progress

### T-001 — Unify Data Models (Subject -> Theme)

**Goal:** Migrate the application's core state from the legacy `Subject/Topic` interfaces to the new `Theme/SubjectCycleState` interfaces without data loss.  
**Started:** 2026-03-17  
**Files being modified:**
- `src/contexts/AppContext.tsx` — Updating state initialization and persistence logic.
- `src/types.ts` — Deprecating legacy types and exporting new unified types.
- `src/utils/migration.ts` — Creating the migration script for existing `localStorage` data.

**Current state:**
The new interfaces (`Theme`, `SubjectCycleState`) exist in the codebase, but `AppContext` still reads/writes using the legacy `Subject` array. A bridge/adapter is needed to migrate existing users on boot.

**Remaining steps:**
- [ ] Write a migration utility that reads `localStorage.getItem('subjects')` and maps it to `themes` and `cycle_states`.
- [ ] Update `AppContext` to provide `themes` and `cycleStates` instead of `subjects`.
- [ ] Refactor `CycleView` and `ManagementView` to read from the new state structures.

**Acceptance criteria:**
- [ ] On app load, if `subjects` exists in `localStorage` and `themes` does not, the app generates `themes` where `Theme.accumulatedTime` exactly equals the legacy `Topic.studiedMinutes`.
- [ ] `CycleView` renders the exact same progress bars and subject order using `SubjectCycleState` as it did with the legacy model.
- [ ] Adding a new topic in `ManagementView` successfully writes a new `Theme` object to the `themes` array in `localStorage`.

**Definition of done:**
The app runs entirely on `Theme` and `SubjectCycleState` models, `localStorage` persists these new keys, and no TypeScript errors remain regarding missing `Subject` properties.

**Known risks:**
- High risk of breaking the UI in multiple places (`CycleView`, `ManagementView`, `StatsView`) since `Subject` is deeply embedded in the component tree.

---

## 📋 Ready to Start

### T-003 — Implement Data Export/Backup

**Priority:** 1 (start next)  
**Estimated size:** Small (< 1 session)  
**Goal:** Allow users to download a JSON file containing their entire `localStorage` state.

**Context:**
The app relies entirely on `localStorage`. If a user clears their browser data, they lose hundreds of hours of study history. A manual export feature is a critical safety net.

**Depends on:** 
- No dependencies — ready now.

**Unblocks:**
- Nothing — independent task (but provides critical data safety).

**Files to create:**
- `src/utils/exportData.ts` — Logic to bundle `localStorage` keys into a Blob.

**Files to modify:**
- `src/components/SettingsView.tsx` — Add "Exportar Dados" button.

**Acceptance criteria:**
- [ ] Clicking "Exportar Dados" triggers a browser download of a file named `ciclo-de-estudos-backup-[DATE].json`.
- [ ] The downloaded JSON file contains valid, parseable JSON including the `studyHistory`, `userStats`, and `archived_enemies` keys.

**Prompt reference:**
Defined in GLOBAL.md Priority 2.

---

### T-004 — Wire up Achievement Triggers

**Priority:** 2  
**Estimated size:** Medium (1-2 sessions)  
**Goal:** Connect the static `AchievementsView` to actual application events so badges unlock dynamically.

**Context:**
Gamification is a core value prop, but achievements currently only exist as a static UI list. They need to listen to study sessions and battle results to unlock.

**Depends on:** 
- No dependencies — ready now.

**Unblocks:**
- Nothing — independent task.

**Files to create:**
- `src/utils/achievementEngine.ts` — Logic to evaluate conditions (e.g., `checkStreakAchievements(streak)`).

**Files to modify:**
- `src/contexts/AppContext.tsx` — Call achievement evaluation inside `addStudySession` and `addXP`.

**Acceptance criteria:**
- [ ] When `addStudySession` is called and pushes the `dailyStreak` to 7, the "Estudioso I" achievement ID is added to `UserStats.unlockedAchievements`.
- [ ] Unlocking an achievement triggers a visual toast/notification in the UI.
- [ ] `AchievementsView` renders the newly unlocked achievement without the grayscale/locked CSS filter.

---

### T-005 — Fix Orphaned Archived Enemies

**Priority:** 3  
**Estimated size:** Small (< 1 session)  
**Goal:** Ensure that deleting a Subject or Topic also deletes its corresponding `ArchivedEnemy` to prevent data bloat and crashes.

**Context:**
Currently, deleting a topic leaves its spaced repetition data in the `archived_enemies` array, wasting space and potentially causing errors in the Vencidos view.

**Depends on:** 
- No dependencies — ready now.

**Unblocks:**
- Nothing — independent task.

**Files to modify:**
- `src/contexts/AppContext.tsx` — Update `deleteTopic` and `deleteSubject` methods.

**Acceptance criteria:**
- [ ] Calling `deleteTopic(topicId)` successfully removes any object from `localStorage` key `archived_enemies` where `enemy.topicId === topicId`.
- [ ] Calling `deleteSubject(subjectId)` successfully removes all objects from `localStorage` key `archived_enemies` where `enemy.subjectId === subjectId`.

---

## ❌ Blocked

### T-002 — Integrate useStudyTimer into FocusModeView

**Blocked by:** T-001 (Unify Data Models)  
**Blocking reason:**
`useStudyTimer` requires `SubjectCycleState` and `Theme` objects as inputs. `FocusModeView` currently only has access to legacy `Subject` and `Topic` objects. The timer cannot be connected until the data models are unified.

**What needs to happen to unblock:**
- [ ] Complete T-001 so `AppContext` provides `SubjectCycleState`.

**Impact of remaining blocked:**
The app continues to use the legacy timer, meaning cycle time and excess time are not tracked separately, and auto-transitions cannot be implemented.

**Workaround available?** No.

---

## ✅ Done This Sprint

*(No tasks completed yet in this sprint. Previous sprint tasks archived to CHANGELOG.md).*

---

## ⏸️ Deferred (moved out of this sprint)

### T-006 — Cloud Synchronization (Firebase)

**Deferred to:** Backlog (Future Phase)  
**Reason for deferral:**
Scope is too large for the current sprint. We must stabilize the local data models (T-001) and implement local backup (T-003) before introducing network synchronization complexity.

**Condition to return:**
Data models are unified, local export is working, and a clear authentication flow is designed.

---

## Integration Checklist

```markdown
[ ] useStudyTimer → FocusModeView
    Status: Blocked (T-002)
    Requires: subjectToTheme adapter / Data Unification (T-001)

[ ] useAutoCycleTransition → FocusModeView
    Status: Not started
    Requires: useStudyTimer connected first (T-002)

[ ] useManualCycleDecision → FocusModeView
    Status: Not started
    Requires: useStudyTimer connected first (T-002)
```

---

## Bug Queue

| ID | Description | Severity | File | Status |
|----|-------------|----------|------|--------|
| B-001 | Orphaned Archived Enemies | Medium | `AppContext.tsx` | 📋 Ready (T-005) |
| B-002 | No schema versioning | Medium | `usePersistedState.ts` | 📋 Ready |
| B-003 | Unbounded studyHistory growth | Low | `AppContext.tsx` | 📋 Ready |
| B-004 | Enemies not appearing in CombatView | High | `CombatView.tsx` | 🔄 In Progress |
| B-005 | Question changes every second in Battle | Critical | `BattleQuestionView.tsx` | ✅ Done |

### B-005 — Question changes every second in Battle
**Severity:** Critical  
**File:** `src/components/BattleQuestionView.tsx`  
**Symptom:** The active question changes automatically every second during a battle.  
**Root cause:** The `topicQuestions` array was not memoized, causing it to be recreated on every render. The 1-second timer triggered continuous re-renders, which in turn caused the `activeQuestions` useMemo to re-run and re-shuffle the questions.  
**Fix approach:** Wrapped the `topicQuestions` creation logic in a `useMemo` hook to stabilize the array reference.  
**Acceptance criteria:** The question remains stable until the user answers it or the time runs out.

### B-004 — Enemies not appearing in CombatView
**Severity:** High  
**File:** `src/components/CombatView.tsx`, `src/contexts/AppContext.tsx`  
**Symptom:** No questions appear and no enemies are added to the rooms.  
**Root cause:** Under investigation. Suspected data initialization or filter synchronization issue.  
**Fix approach:** Added extensive logging to track data flow and fixed `filters` state initialization.  
**Acceptance criteria:** Enemies are correctly generated and displayed in their respective rooms based on topics and questions.

### B-002 — No schema versioning
**Severity:** Medium  
**File:** `src/hooks/usePersistedState.ts`  
**Symptom:** `localStorage` contains raw data arrays without any version identifier.  
**Root cause:** Initial implementation did not anticipate schema migrations.  
**Fix approach:** Wrap root `localStorage` writes in an object containing `{ version: 1, data: [...] }` or add a dedicated `schema_version` key.  
**Acceptance criteria:** `localStorage.getItem('schema_version')` returns `'1'` on app boot.

---

## Session Log

**Session 2026-03-22 (Current):**
  - **In Progress:** B-004 (Enemies not appearing in CombatView) — Added extensive logging to `CombatView.tsx` and `AppContext.tsx` to trace data initialization and filter synchronization. Fixed an issue where the `subject` filter was not correctly initialized when `subjectId` was passed.
  - **Next steps:** Analyze the new logs to pinpoint why enemies are not being generated or displayed.

**Session 2026-03-17:**
  - **Completed:** Sprint planning and documentation generation (`GLOBAL.md`, `PRD.md`, `DATABASE.md`, `CHANGELOG.md`, `SPRINT_ATUAL.md`).
  - **In Progress:** T-001 (Data Model Unification) — defined scope and acceptance criteria.
  - **Discovered:** Identified the critical blocker between `useStudyTimer` and `FocusModeView`.
  - **Decisions made:** Prioritize local JSON export before attempting any Firebase/Cloud sync to ensure data safety.
  - **Next session should start with:** T-001 — Write the migration utility in `src/utils/migration.ts`.

---

## Sprint Metrics

**Total tasks:** 5
  - Done: 0 (0%)
  - In Progress: 1
  - Ready: 3
  - Blocked: 1
  - Deferred: 1

**Total bugs:** 3
  - Fixed this sprint: 0
  - Remaining: 3

**Sprint health:** 🟢 On track

---

## Document Maintenance Rules

Update this file:
  - **START of session:** Read Status Board, check blockers, confirm first task.
  - **END of session:** Update task statuses, add session log entry, move completed tasks to Done section, update remaining steps for in-progress tasks.

NEVER update during a session — focus on the work, not the docs.

Archive tasks to CHANGELOG.md when:
  - Sprint ends (move all Done tasks)
  - Done section exceeds 10 tasks
  - More than 2 sprints of history accumulates

Move tasks to GLOBAL.md backlog when:
  - Task is deferred more than 2 sprints in a row
  - Task loses priority relative to new discoveries

---

## Next Sprint Preview

Based on what remains in GLOBAL.md after this sprint completes, the next sprint should focus on:

**Likely next sprint goal:** Finalize Gamification and Advanced Analytics.

**Tasks likely to carry over:**
- T-004 (Achievement Triggers) if data unification takes longer than expected.

**New tasks likely to enter:**
- Implement Data Import/Restore (complementing the Export feature).
- Detailed Topic Analytics (Mastery curves).

**Dependencies to resolve before next sprint starts:**
- Ensure the new `Theme` data model is 100% stable and bug-free in production.

---
*This preview is updated at the end of each sprint.*
*It becomes the foundation for the next SPRINT_ATUAL.md.*
