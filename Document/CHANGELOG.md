# Changelog

> This changelog follows a modified [Keep a Changelog](https://keepachangelog.com) 
> format adapted for AI-assisted development.  
> Each entry represents a development session, version, or significant milestone.  
> **Reconstructed from codebase analysis**

---

## Format Reference

Each entry uses these change type labels:
- ✅ ADDED — new feature or file added
- 🔄 CHANGED — existing behavior modified
- 🐛 FIXED — bug corrected
- 🗑️ REMOVED — feature or file deleted
- ⚠️ DEPRECATED — marked for future removal
- 🏗️ REFACTOR — code restructured without behavior change
- 📋 PLANNED — documented as next step but not yet implemented
- 🔒 SECURITY — security-related change

---

## [1.1.0] — 2026-04-11

> **Session summary:** Implemented full PWA support, refined global navigation, and completed the data model migration from legacy `Subject` to `Theme` + `SubjectCycleState`.  
> **Codebase state after this session:** The app is now installable, works offline, has a more robust navigation flow, and runs on the new granular data architecture.

### ✅ ADDED
- **PWA Support:** Integrated `vite-plugin-pwa` with custom manifest and service worker.
  - Files: `vite.config.ts`, `vite-env.d.ts`, `PWA_DEPLOYMENT.md`.
- **PWA Install Prompt:** Custom hook and component to handle app installation.
  - Files: `src/hooks/usePWAInstall.ts`, `src/components/PWAInstallPrompt.tsx`.
- **Push Notifications Utility:** Base logic for requesting permissions and subscribing to push.
  - File: `src/utils/pushNotifications.ts`.
- **Data Migration:** Script to migrate legacy `Subject` data to `Theme` and `SubjectCycleState`.
  - File: `src/utils/migration.ts`.

### 🔄 CHANGED
- **Global Navigation:** Refactored `App.tsx` to reset sub-views when switching main tabs.
- **Header Back Button:** Added `onBack` support to `Header.tsx` and integrated it into the main navigation flow.
- **Settings UI:** Added a toggle for Push Notifications.
- **App Metadata:** Updated `index.html` title and theme colors.
- **Data Architecture:** `AppContext` now uses `themes` and `cycleStates` instead of `subjects`. `CycleView` and `SubjectCard` updated to consume the new models.

### 🐛 FIXED
- **Workbox Cache Limit:** Increased `maximumFileSizeToCacheInBytes` to 5MB to allow caching of the main JS bundle.
- **TypeScript Types:** Added `vite-env.d.ts` to resolve `virtual:pwa-register` type errors.
- **Missing Imports:** Restored missing imports in `useFirebaseSync.ts`.
- **Syntax Errors:** Fixed syntax errors in `CycleView.tsx`.
- **Lint Errors:** Implemented `updateSubjectTopics` locally in `App.tsx` to fix lint errors during migration.

---

## [Unreleased] — In Progress

Changes that are built but not yet fully integrated or complete.

### 🐛 FIXED / DEBUGGING
- **BattleQuestionView Question Shuffling:** Fixed a critical bug where the active question would change every second. The `topicQuestions` array was being recreated on every render (triggered by the 1-second timer), causing the `activeQuestions` useMemo to re-run and re-shuffle the questions continuously. Wrapped the question filtering and mapping logic in a `useMemo` to stabilize the array reference.
  - File modified: `src/components/BattleQuestionView.tsx`
- **CombatView Enemy Generation:** Added extensive logging to `CombatView.tsx` and `AppContext.tsx` to diagnose why enemies were not appearing in the rooms. Fixed an issue with the `filters` state initialization in `CombatView.tsx` to correctly synchronize the `subject` filter when `subjectId` is provided.
  - Files modified: `src/components/CombatView.tsx`, `src/contexts/AppContext.tsx`

### ✅ ADDED (partial — not yet connected)
- `useStudyTimer` hook: dual-counter timer tracking cycleTime (capped at goal) and themeTime (uncapped) simultaneously.
  - File: `src/hooks/useStudyTimer.ts`
  - Status: Implemented and tested in isolation.
  - NOT YET CONNECTED: `FocusModeView` still uses the legacy timer.
  - Connection plan: requires subjectToTheme adapter (GLOBAL.md Priority 1).
- `useAutoCycleTransition` hook: automatic subject advancement with countdown.
  - File: `src/hooks/useAutoCycleTransition.ts`
  - Status: Built, not connected to UI.
- `useManualCycleDecision` hook: manual decision prompt on goal reached.
  - File: `src/hooks/useManualCycleDecision.ts`
  - Status: Built, not connected to UI.

### 📋 PLANNED
- Full Data Export/Backup: Allow users to download their full state as a JSON file.
  - Depends on: `AppContext` state serialization.
  - Tracked in: GLOBAL.md Priority 2.
- Achievement Triggers: Wire up the actual event triggers to unlock achievements during gameplay.
  - Depends on: Existing `addStudySession` and `addXP` logic.
  - Tracked in: GLOBAL.md Priority 3.

---

## Current State — Phase 4/5 Completion

### Summary of what is fully working
- **Study Cycle:** User can create subjects, add topics, set time goals, and view their cycle progress.
- **Focus Timer:** User can start a timer for a subject, hear ambient sounds, and record the session which updates their XP and cycle progress.
- **Battles:** User can import/create questions, configure a battle, answer questions with confidence levels, and see their topics move between spaced repetition rooms.
- **Statistics:** User can view their study history, time distribution, and battle performance.

### Summary of what is built but disconnected
- **New Timer Hooks:** `useStudyTimer`, `useAutoCycleTransition`, and `useManualCycleDecision` are built but orphaned due to data model mismatches (`Subject/Topic` vs `Theme/SubjectCycleState`).

### Summary of known issues
- **Achievements Logic:** UI exists but achievements are not dynamically unlocked based on user actions.
- **Data Safety:** App relies entirely on `localStorage` with no full export/backup mechanism implemented yet.

---

## Session 6 — Architecture Refactor & New Data Models

> **Session summary:** Refactored navigation to be more scalable and introduced new data models for a more robust timer system.  
> **Codebase state after this session:** UI navigation is stable. New timer logic exists but is running in parallel to the legacy system, creating a technical debt bridge that needs to be crossed.

### ✅ ADDED
- Theme data model: TypeScript interfaces for `Theme` and `SubjectCycleState` with dual completion tracking.
  - Files created: `src/types/theme.types.ts`, `src/types/subjectCycle.types.ts`
  - Key behavior: Separates cycle goal time from total accumulated mastery time.
  - Depends on: Need for more accurate cycle tracking.

### 🔄 CHANGED
- Navigation system: replaced multiple independent boolean flags with a single `activeView` union type state.
  - Old: `const [isTimeStatsView, setIsTimeStatsView] = useState(false)` × multiple separate flags.
  - New: `const [activeView, setActiveView] = useState<ActiveView>('main')`
  - Reason: Multiple flags could be true simultaneously causing view overlap — union type enforces mutual exclusivity.
  - Files modified: `src/App.tsx`, `src/types/navigation.types.ts`

### 🐛 FIXED
- Invalid initial mock data in `constants.tsx`:
  - `studiedMinutes` was 1470 > `totalMinutes` 120 for Matemática.
  - Root cause: Manual data entry error — no validation existed.
  - Fix: Corrected data values to ensure `studiedMinutes <= totalMinutes`.
  - File: `src/constants.tsx`

---

## Session 5 — Analytics, Insights & Data Import

> **Session summary:** Added visual dashboards for users to track their progress and a utility to import questions.  
> **Codebase state after this session:** Users can now visualize their study time and battle performance, and import external question banks.

### ✅ ADDED
- Time Statistics: Charts and metrics for time spent studying.
  - Files created: `src/components/TimeStatsView.tsx`
  - Key behavior: Displays donut charts, daily streaks, and total time.
- Battle Statistics: Performance metrics for battles.
  - Files created: `src/components/BattleStatsView.tsx`, `src/components/BattleHistoryView.tsx`
  - Key behavior: Shows accuracy rates, room distributions, and historical logs.
- JSON Import: Utility to import questions.
  - Files created: `src/components/ImportJsonView.tsx`
  - Key behavior: Parses JSON and adds to the question bank.

---

## Session 4 — Spaced Repetition Engine

> **Session summary:** Implemented the core spaced repetition algorithm based on the Ebbinghaus forgetting curve.  
> **Codebase state after this session:** The app can now intelligently classify topics into rooms and schedule them for review.

### ✅ ADDED
- Confidence Scoring: Logic to calculate weighted scores based on correctness and user confidence.
  - Files created: `src/utils/confidenceScoring.ts`
  - Key behavior: Penalizes "wrong + certain" answers heavily, rewards "correct + certain".
- Ebbinghaus Engine: Calculates memory stability and retention probability.
  - Files created: `src/utils/ebbinghaus.ts`
  - Key behavior: Determines when an archived enemy should return to the "Alerta" room.
- Archived Enemy Model: Tracks mastered topics.
  - Files modified: `src/types/storage.types.ts`

---

## Session 3 — Battle System & Gamification

> **Session summary:** Built the active recall quiz interface and introduced RPG mechanics.  
> **Codebase state after this session:** Users can answer questions, lose HP, gain XP, and level up.

### ✅ ADDED
- Battle System (Combat): Gamified quiz interface.
  - Files created: `src/components/BattleView.tsx`, `src/components/BattleQuestionView.tsx`, `src/components/CombatView.tsx`
  - Key behavior: Presents questions, tracks HP, calculates damage, and provides immediate feedback.
- Question Bank Management: CRUD for questions.
  - Files created: `src/components/QuestionManagerView.tsx`, `src/components/QuestionBankView.tsx`
- Gamification Stats: XP, HP, Stamina, and Levels.
  - Files modified: `src/contexts/AppContext.tsx`, `src/components/Header.tsx`
  - Key behavior: XP accumulates from study sessions and battles, triggering level ups.
- Achievements System (UI Only):
  - Files created: `src/components/AchievementsView.tsx`
  - Key behavior: Displays unlockable badges.

---

## Session 2 — Core Study Loop & Timer

> **Session summary:** Implemented the visual study cycle and the Pomodoro focus timer.  
> **Codebase state after this session:** Users can track their progress through a cycle and record timed study sessions.

### ✅ ADDED
- Study Cycle View: Visual representation of the study cycle.
  - Files created: `src/components/CycleView.tsx`, `src/components/CycleProgressBar.tsx`
  - Key behavior: Shows progress bars and highlights the active subject.
- Focus Timer (Legacy): Pomodoro-style timer.
  - Files created: `src/components/FocusModeView.tsx`, `src/components/PomodoroSettingsView.tsx`
  - Key behavior: Tracks active study time, manages breaks, plays ambient sounds.
- Subject & Topic Management: CRUD UI for the curriculum.
  - Files created: `src/components/ManagementView.tsx`, `src/components/SubjectDetailView.tsx`, `src/components/AddTopicView.tsx`

### ⚠️ KNOWN ISSUES
- `studiedMinutes > totalMinutes` in mock data: Matemática has `studiedMinutes`: 1470 but `totalMinutes`: 120 — progress exceeds 100%.
  - Tracked in: ARCHITECTURE.md DEBT-001 (Fixed in Session 6).

---

## Foundation — Data Models and Project Setup

> **Session summary:** Initialized the project repository, configured build tools, and defined the core domain models.  
> **Codebase state after this session:** A blank React app with Tailwind styling, global state context, and TypeScript interfaces ready for UI implementation.

### ✅ ADDED
- Project initialized: React 19 + TypeScript + Vite + Tailwind CSS.
  - Files created: `package.json`, `vite.config.ts`, `tailwind.config.js`, `index.html`
- Core type definitions: Legacy models for the study cycle.
  - Files created: `src/types.ts`, `src/types/storage.types.ts`
  - Key behavior: Defined `Subject`, `Topic`, `StudySession`, `UserStats`.
- Global State Management: React Context for persisting data to `localStorage`.
  - Files created: `src/contexts/AppContext.tsx`, `src/hooks/usePersistedState.ts`
- Base UI Shell: Main layout components.
  - Files created: `src/App.tsx`, `src/components/Header.tsx`, `src/components/BottomNav.tsx`, `src/components/SideNavigation.tsx`

---

## Reconstruction Notes

This changelog was reconstructed from codebase analysis rather than git history. The following assumptions were made:

1. **Foundation/data models:** High confidence. The legacy `Subject`/`Topic` models and `AppContext` must have existed before any UI views were built.
2. **Feature implementation order:** Medium confidence. Inferred from the natural progression of a study app (Cycle -> Timer -> Battles -> Spaced Repetition -> Analytics).
3. **Architecture Refactor:** High confidence. The presence of unused hooks (`useStudyTimer`) and new types (`Theme`) alongside a working legacy system clearly indicates a recent, incomplete refactor session.
4. **Bug discovery timing:** Low confidence. The mock data bug was placed in Session 2 (when the UI would have first rendered it) and fixed in Session 6 (during the refactor), but exact timing is inferred.

---

## Changelog Maintenance Guide

### When to update this file
Update CHANGELOG.md at the END of every development session, before closing. Never update it during a session — wait until the work is complete and the outcome is known.

### What belongs here vs other documents
- New feature added → CHANGELOG.md (ADDED) + GLOBAL.md (status update)
- Bug fixed → CHANGELOG.md (FIXED) + ARCHITECTURE.md (remove debt item)
- Architecture decision → CHANGELOG.md (CHANGED) + DECISIONS.md (new ADR)
- Feature planned → GLOBAL.md only (not CHANGELOG until built)
- Requirement clarified → PRD.md only (not CHANGELOG)

### Entry quality standard
A good changelog entry answers:
  WHO would care about this change?
  WHAT specifically changed?  
  WHY was this change made?
  WHERE in the codebase does this live?
  
A poor changelog entry:
  "Updated components" — too vague
  "Fixed bugs" — not specific
  "Refactored code" — no detail on what or why

### Version numbering (when to bump)
- Patch (0.0.X): bug fixes only
- Minor (0.X.0): new feature added, backward compatible
- Major (X.0.0): breaking change or significant milestone

### Session Template
```markdown
## [vX.X.X or "Session YYYY-MM-DD"] — [Date]

> **Session summary:** 
> **Codebase state after this session:** 

### ✅ ADDED
- 

### 🔄 CHANGED
- 

### 🐛 FIXED
- 

### 🗑️ REMOVED
- 

### 📋 NEXT SESSION
- 
```
