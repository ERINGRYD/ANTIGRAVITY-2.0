# Documentation & Architecture Audit Report

> **Date:** 2026-03-18
> **Scope:** `/Document` folder and `src/` codebase cross-reference.
> **Objective:** Identify gaps, inaccuracies, contradictions, and missing coverage.

---

## Executive Summary

The documentation audit reveals a project in a precarious transitional state. While the UI and individual components are well-developed, a recent, incomplete architectural refactor has created a severe disconnect between the documented data models, the active hooks, and the persistence layer. 

The most critical finding is the **Data Model Schism**: the application is currently running two parallel, incompatible data models. Furthermore, the reliance on `localStorage` for unbounded data growth (history, questions) poses an imminent risk of application failure due to browser storage limits.

Previous patches (`PRD_CORRIGIDO.md`, `GLOBAL_PATCH.md`, `DECISIONS_PATCH.md`) have been generated to correct optimistic status reporting and document missing business rules. This report synthesizes the remaining structural and architectural gaps.

---

## 1. Critical Architectural Contradictions & Blockers

### 1.1 The Data Model Schism (Legacy vs. New)
- **The Contradiction:** `DATABASE.md` (Lines 316-332) and `HOOKS.md` (Lines 24-30) reveal that the new, highly complex timer hooks (`useStudyTimer`, `useAutoCycleTransition`) rely on a new data model (`Theme` / `SubjectCycleState`). However, the application's persistence layer (`AppContext`) still exclusively uses the legacy `Subject` / `Topic` model.
- **The Impact:** The new timer logic is completely orphaned. As noted in `CHANGELOG.md` (Lines 59-60), the UI works, but the new hooks are disconnected. If the app reloads, any state managed by the new models is lost because it is not persisted.
- **Missing Coverage:** There is no documented, step-by-step migration plan to safely move user data from the `subjects` key to the new `themes` and `cycle_states` keys without data loss. `DATABASE.md` (Lines 450-462) outlines a high-level strategy, but the actual adapter (`src/adapters/subjectToTheme.ts`) is only stubbed.

### 1.2 Storage Scalability & The 5MB Timebomb
- **The Gap:** `DATABASE.md` (Lines 352-361 and 481-486) identifies that `studyHistory` and `questions` grow unboundedly in `localStorage`. 
- **The Contradiction:** The app aims to support "concursos" (which implies thousands of questions), but `DATABASE.md` (Lines 555-557) explicitly states `localStorage` will fail immediately under this load. There is no Architecture Decision Record (ADR) in `DECISIONS.md` addressing a migration to IndexedDB or SQLite.
- **The Impact:** Heavy users will inevitably hit the 5MB browser quota, causing `localStorage.setItem` to throw `QuotaExceededError`, crashing the app and resulting in data loss.

### 1.3 Missing Schema Versioning
- **The Gap:** `DATABASE.md` (Lines 474-479) notes the absence of a `schema_version` key in storage.
- **The Impact:** As the data models are currently changing (Legacy to New), the lack of versioning makes safe, programmatic data migrations nearly impossible, risking corruption of existing user data upon deployment of the new models.

---

## 2. Gaps in Business Logic & Implementation

### 2.1 Orphaned Data on Deletion (Data Integrity)
- **The Gap:** `DATABASE.md` (Lines 488-493) and `API_CONTRACTS.md` (Lines 405-410) document that deleting a `Subject` or `Topic` does not cascade to delete associated `ArchivedEnemy` records.
- **The Impact:** This violates data integrity. The `archived_enemies` array will bloat with orphaned records, and the `VencidosPage` may crash if it attempts to render an enemy whose parent topic no longer exists.

### 2.2 Achievement Engine Disconnect
- **The Contradiction:** `PRD_CORRIGIDO.md` lists Achievements as a feature, and `CHANGELOG.md` (Lines 144-146) notes the UI exists. However, `CHANGELOG.md` (Lines 62-63) and `API_CONTRACTS.md` (Lines 469-470) reveal that the actual event triggers to unlock these achievements are not wired up. The behavior of `onAchievementUnlocked` is completely undocumented and ambiguous.

### 2.3 Notification System Mirage
- **The Gap:** `PRD_CORRIGIDO.md` notes that `NotificationsView.tsx` contains UI toggles for various alerts, but there is absolutely no underlying delivery mechanism (e.g., Service Workers, Web Notifications API, or even in-app toast queues) implemented or documented to support these toggles.

---

## 3. API & Type Contract Violations

### 3.1 AppContext Type Safety (`as any`)
- **The Violation:** `API_CONTRACTS.md` (Lines 397-403) flags a critical type safety violation in `src/contexts/AppContext.tsx` where the default context value is cast `as any`.
- **The Impact:** This defeats TypeScript's compiler checks. If the `AppContextType` interface changes, the compiler will not catch missing implementations in the default provider, leading to potential runtime crashes.

### 3.2 Loose Typing on Analytics Data (`errorReasons`)
- **The Violation:** `API_CONTRACTS.md` (Lines 472-474) notes that `errorReasons` in the `StudySession` interface uses a generic `Record<string, number>` instead of a strict union of literal types (e.g., `'content' | 'interpretation' | 'distraction'`).
- **The Impact:** This allows typos when recording error stats, which will silently corrupt the analytics data displayed in the `BattleStatsView`.

---

## 4. Documentation Inaccuracies (Addressed via Patches)

During this audit, several severe inaccuracies were found in the primary documentation and immediately corrected via patch files:

1. **Status Inflation (`GLOBAL.md`):** The original document claimed ~75% completion. `GLOBAL_PATCH.md` corrected this to ~45%, accurately reflecting that many features (like the timer hooks) are built but disconnected.
2. **Missing Business Rules (`PRD.md`):** The original PRD lacked specific rules for confidence scoring, room classification, and dual-timers. `PRD_CORRIGIDO.md` was generated to document the actual implemented logic.
3. **Missing Architectural Context (`DECISIONS.md`):** Crucial decisions regarding the Spaced Repetition algorithm, the dual-timer logic, and the data model migration were undocumented. `DECISIONS_PATCH.md` added ADRs 010 through 027 to capture this context.

---

## 5. Actionable Recommendations (Prioritized)

1. **P0: Resolve the Data Model Schism:** Halt all new feature development. Execute the migration from `Subject/Topic` to `Theme/SubjectCycleState`. Implement `schema_version` immediately to protect existing user data during this transition.
2. **P0: Connect the Timer Hooks:** Once the data models are unified, integrate `useStudyTimer`, `useAutoCycleTransition`, and `useManualCycleDecision` into `FocusModeView`.
3. **P1: Implement Data Export/Backup:** Before the 5MB `localStorage` limit becomes a widespread issue, implement a feature allowing users to download their state as a JSON file.
4. **P1: Fix Orphaned Data:** Update the `deleteSubject` and `deleteTopic` functions in `AppContext` to cascade deletions to the `archived_enemies` array.
5. **P2: Address Type Violations:** Remove the `as any` cast in `AppContext.tsx` and strictly type the `errorReasons` keys in `storage.types.ts`.
6. **P3: Architectural Decision on Storage:** Write an ADR deciding between IndexedDB (e.g., via Dexie.js) or a local SQLite WASM implementation to handle the unbounded growth of the Question Bank and Study History.
