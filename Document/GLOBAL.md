# Global Roadmap

> **Product:** Ciclo de Estudos (Tempos Labs)  
> **Current Phase:** Phase 2 — Timer Refactor & Gamification Polish  
> **Overall completion:** ~75% (estimated)  
> **Last updated:** 2026-03-17

---

## Product Vision

Ciclo de Estudos is a gamified study management application designed to help students optimize their learning through structured study cycles, spaced repetition, and RPG-like engagement mechanics. It transforms the grueling process of exam preparation into an engaging journey where users earn XP, battle topics, and track their mastery over time.

### Core Value Proposition
Combines the discipline of cycle-based study planning with the engagement of RPG mechanics and the efficiency of spaced repetition algorithms.

### Target User
Students preparing for high-stakes exams (like "concursos públicos" or university entrance exams) who need structure, motivation, and data-driven insights to manage vast amounts of content.

---

## Product Map

| Feature Area | Status | Phase | Notes |
|--------------|--------|-------|-------|
| Subject & Topic Management | ✅ Complete | 1 | CRUD operations working |
| Study Cycle UI | ✅ Complete | 1 | Visual progress and ordering |
| Timer System | ⚠️ Partial | 1 | UI works, but new hooks are disconnected |
| Battle System | ✅ Complete | 3 | Question answering and combat UI |
| Spaced Repetition | ✅ Complete | 3 | Confidence scoring and room classification |
| Statistics & History | ✅ Complete | 4 | Time and battle stats visible |
| Gamification | ⚠️ Partial | 2 | XP/HP works, achievements need deeper integration |
| Data Import/Export | ⚠️ Partial | 5 | JSON import exists, export missing/stubbed |

Status legend:
✅ Complete — fully working and integrated
⚠️ Partial — built but incomplete or not connected
🔄 In Progress — actively being worked on
📋 Planned — defined but not started
❌ Blocked — cannot proceed due to dependency

---

## Phases

### Phase 1 — Core Study Loop
**Goal:** Establish the foundational ability to create subjects, organize topics, and track study time.  
**Status:** ⚠️ Mostly Complete

#### Features in this phase:

**Subject & Topic Management**
- Status: ✅ Complete
- Files: `src/components/ManagementView.tsx`, `src/components/SubjectDetailView.tsx`, `src/components/AddTopicView.tsx`
- Description: Create, edit, and delete subjects and their nested topics.
- What works: Full CRUD, drag-and-drop reordering, color selection.
- What is missing: Nothing — complete.
- Blocks: Everything else.

**Study Cycle View**
- Status: ✅ Complete
- Files: `src/components/CycleView.tsx`
- Description: Visual representation of the study cycle and progress.
- What works: Progress bars, active subject highlighting, cycle completion detection.
- What is missing: Nothing — complete.
- Blocks: Timer initiation.

**Focus Timer (Legacy)**
- Status: ⚠️ Partial
- Files: `src/components/FocusModeView.tsx`
- Description: Pomodoro-style timer for tracking study sessions.
- What works: Countdown, pause/resume, ambient sounds, session recording.
- What is missing: Integration with the new dual-counter architecture (`useStudyTimer`).
- Blocks: Advanced cycle transitions.

**New Timer Hooks Architecture**
- Status: ⚠️ Partial
- Files: `src/hooks/useStudyTimer.ts`, `src/hooks/useAutoCycleTransition.ts`, `src/hooks/useManualCycleDecision.ts`
- Description: Robust, decoupled timer logic supporting dual counters (cycle time vs accumulated time).
- What works: Logic is fully written and tested in isolation.
- What is missing: Not connected to `FocusModeView`. Requires data model adapter.
- Blocks: Phase 2 auto-transitions.

#### Phase completion: 2/4 features complete

---

### Phase 2 — Gamification Polish
**Goal:** Make studying engaging through RPG mechanics and rewards.  
**Status:** ⚠️ Mostly Complete

#### Features in this phase:

**User Stats (XP, HP, Stamina)**
- Status: ✅ Complete
- Files: `src/contexts/AppContext.tsx`, `src/components/Header.tsx`
- Description: Core RPG attributes that respond to study sessions and battles.
- What works: XP accumulation, leveling up, HP/Stamina display.
- What is missing: Nothing — complete.
- Blocks: Achievements.

**Achievements System**
- Status: ⚠️ Partial
- Files: `src/components/AchievementsView.tsx`
- Description: Unlockable badges for reaching milestones.
- What works: UI for displaying achievements.
- What is missing: The actual event triggers to unlock most achievements during gameplay.
- Blocks: None.

#### Phase completion: 1/2 features complete

---

### Phase 3 — Battle & Spaced Repetition
**Goal:** Assess knowledge and schedule reviews using active recall and spaced repetition.  
**Status:** ✅ Complete

#### Features in this phase:

**Question Bank & Management**
- Status: ✅ Complete
- Files: `src/components/QuestionManagerView.tsx`, `src/components/QuestionBankView.tsx`
- Description: Create and manage questions for battles.
- What works: Adding questions (multiple choice, flashcards), filtering, editing.
- What is missing: Nothing — complete.
- Blocks: Battle System.

**Battle System (Combat)**
- Status: ✅ Complete
- Files: `src/components/BattleView.tsx`, `src/components/BattleQuestionView.tsx`, `src/components/CombatView.tsx`
- Description: Gamified quiz interface where users fight "enemies" (topics).
- What works: Question presentation, health bars, damage calculation, result feedback.
- What is missing: Nothing — complete.
- Blocks: Spaced Repetition scoring.

**Spaced Repetition Engine**
- Status: ✅ Complete
- Files: `src/utils/confidenceScoring.ts`, `src/utils/ebbinghaus.ts`
- Description: Calculates memory stability and assigns topics to review rooms.
- What works: Confidence-based scoring, room classification (reconhecimento, critica, alerta, vencidos).
- What is missing: Nothing — complete.
- Blocks: None.

#### Phase completion: 3/3 features complete

---

### Phase 4 — Analytics & Insights
**Goal:** Provide users with data to understand their study habits and performance.  
**Status:** ✅ Complete

#### Features in this phase:

**Time Statistics**
- Status: ✅ Complete
- Files: `src/components/TimeStatsView.tsx`
- Description: Charts and metrics for time spent studying.
- What works: Donut charts, daily streaks, total time.
- What is missing: Nothing — complete.
- Blocks: None.

**Battle Statistics**
- Status: ✅ Complete
- Files: `src/components/BattleStatsView.tsx`, `src/components/BattleHistoryView.tsx`
- Description: Performance metrics for battles.
- What works: Accuracy rates, room distributions, historical logs.
- What is missing: Nothing — complete.
- Blocks: None.

#### Phase completion: 2/2 features complete

---

### Phase 5 — Advanced Features & Polish
**Goal:** Enhance usability, data portability, and long-term retention.  
**Status:** 📋 Not Started / 🔄 In Progress

#### Features in this phase:

**Data Import/Export**
- Status: ⚠️ Partial
- Files: `src/components/ImportJsonView.tsx`
- Description: Allow users to backup and restore their data.
- What works: JSON import for questions.
- What is missing: Full state export (backup) and restore functionality.
- Blocks: None.

**Cloud Sync**
- Status: 📋 Planned
- Files: N/A
- Description: Sync data across devices using a backend (e.g., Firebase).
- What works: Nothing.
- What is missing: Everything. Currently relies entirely on `localStorage`.
- Blocks: None.

#### Phase completion: 0/2 features complete

---

## Current State Summary

### What is fully working end-to-end
- **Study Cycle:** User can create subjects, add topics, set time goals, and view their cycle progress.
- **Focus Timer:** User can start a timer for a subject, hear ambient sounds, and record the session which updates their XP and cycle progress.
- **Battles:** User can import/create questions, configure a battle, answer questions with confidence levels, and see their topics move between spaced repetition rooms.
- **Statistics:** User can view their study history, time distribution, and battle performance.

### What is built but not connected
- **`useStudyTimer` hook:** Built in `src/hooks/useStudyTimer.ts`, not yet integrated because it uses the new `Theme`/`SubjectCycleState` data model, while `FocusModeView` still uses the old `Subject`/`Topic` model.
- **`useAutoCycleTransition` hook:** Built in `src/hooks/useAutoCycleTransition.ts`, not connected for the same reason.
- **`useManualCycleDecision` hook:** Built in `src/hooks/useManualCycleDecision.ts`, not connected for the same reason.

### What is visually present but logically broken
- **Achievements:** Shows a list of achievements, but the logic to actually unlock most of them during normal app usage (e.g., "Study for 10 hours") is not fully wired up across all relevant actions.

---

## Technical Debt Impact on Roadmap

| Debt Item | Severity | Blocks |
|-----------|----------|--------|
| Two parallel data models (`Subject` vs `Theme`) | High | Integration of new timer hooks |
| `localStorage` reliance for core state | Medium | Cloud Sync implementation |
| Monolithic `App.tsx` navigation | Low | Future routing scalability |

---

## Next Development Priorities

### Priority 1 — Unify Data Models & Integrate Timer Hooks
**Why now:** The new timer hooks contain critical logic for dual-counter tracking (cycle time vs accumulated time) but are orphaned due to data model mismatches.  
**Depends on:** Existing `FocusModeView` and new hooks.  
**Unblocks:** Accurate cycle tracking, auto-transitions, and manual cycle decisions.  
**Estimated scope:** Large (8+ prompts)  
**Files to create/modify:** `src/components/FocusModeView.tsx`, `src/contexts/AppContext.tsx`, `src/types.ts` (to merge `Subject`/`Topic` with `Theme`/`SubjectCycleState`).

### Priority 2 — Implement Full Data Export/Backup
**Why now:** Since the app relies on `localStorage`, users risk losing all data if they clear browser data. A manual export feature is critical for data safety.  
**Depends on:** `AppContext` state.  
**Unblocks:** User peace of mind, easier debugging.  
**Estimated scope:** Small (1-3 prompts)  
**Files to create/modify:** `src/components/SettingsView.tsx` (add export button), `src/utils/storage.ts` (create export logic).

### Priority 3 — Wire Up Achievement Triggers
**Why now:** Gamification is a core value prop, but achievements are mostly static.  
**Depends on:** Existing `addStudySession` and `addXP` logic.  
**Unblocks:** Full gamification loop.  
**Estimated scope:** Medium (4-7 prompts)  
**Files to create/modify:** `src/contexts/AppContext.tsx`, `src/components/FocusModeView.tsx`, `src/components/BattleQuestionView.tsx`.

---

## Feature Backlog

### Near-term backlog (could be next phase)
- [ ] **Data Export/Backup:** Allow users to download their full state as a JSON file.
- [ ] **Customizable Themes:** Allow users to create custom color palettes beyond light/dark mode.
- [ ] **Detailed Topic Analytics:** Show mastery curves for individual topics over time.

### Long-term backlog (future phases)
- [ ] **Cloud Synchronization:** Firebase integration for cross-device sync.
- [ ] **Social/Leaderboards:** Compare stats with friends or global users.
- [ ] **AI Question Generation:** Use Gemini to automatically generate flashcards from study notes.

### Explicitly out of scope (for now)
- **Multiplayer Battles:** Deferred because real-time sync is too complex for the current `localStorage` architecture — revisit after Cloud Sync.

---

## Integration Checklist

```markdown
[ ] useStudyTimer → FocusModeView
      Requires: Unifying `Subject`/`Topic` with `Theme`/`SubjectCycleState` models.
      Outcome: New dual-counter timer active in focus mode.

[ ] useAutoCycleTransition → FocusModeView (isAutoCycle=true path)
      Requires: useStudyTimer connected first.
      Outcome: Automatic subject advancement with countdown when goal reached.

[ ] useManualCycleDecision → FocusModeView (isAutoCycle=false path)
      Requires: useStudyTimer connected first.
      Outcome: Manual decision prompt on goal reached.
```

---

## Phase Transition Criteria

Current phase (Phase 2 - Gamification Polish & Timer Refactor) is complete when:
- [ ] `FocusModeView` uses `useStudyTimer` and correctly updates cycle vs accumulated time.
- [ ] Auto-cycle and manual cycle transitions work seamlessly.
- [ ] Achievements are dynamically unlocked based on user actions.

The next phase (Phase 5 - Advanced Features) should NOT start until:
- [ ] The dual data model technical debt is resolved.

---

## Metrics and Success Criteria

**Must have for v1.0**
- Stable, bug-free study cycle tracking.
- Working spaced repetition algorithm that accurately schedules reviews.
- Data persistence (even if just local) with a manual backup option.

**Should have for v1.0**
- Fully integrated gamification (XP, levels, achievements).
- Smooth transitions between subjects in the timer.

**Nice to have post v1.0**
- Cloud sync.
- AI features.

---

## Document Maintenance Rules
Update this file when:
- A feature moves from Planned → In Progress
- A feature moves from In Progress → Complete
- A new feature is added to any phase
- A priority changes in Next Development Priorities
- A phase is completed

Do NOT update this file for:
- Individual bug fixes (use CHANGELOG.md)
- Refactors that do not add features (use CHANGELOG.md)
- Sprint-level task details (use SPRINT_ATUAL.md)

---

## Questions for the Development Team

- **Data Model Unification:** What is the preferred strategy for merging `Subject`/`Topic` with `Theme`/`SubjectCycleState`? Should we migrate all existing `localStorage` data to the new format, or adapt the hooks to use the old format?
- **Achievements Logic:** Are the conditions for unlocking achievements defined anywhere, or should they be designed from scratch?
- **Cloud Sync:** Is Firebase the intended backend for future cloud sync, or is another service preferred?
