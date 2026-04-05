# Global Roadmap Patch

This file contains targeted corrections to the existing `GLOBAL.md` document to accurately reflect the true state of the codebase.

---

## Section 1 — Corrections to the Product Map table

Replace the existing Product Map table with this corrected version:

| Feature Area | Status | Phase | Notes |
|--------------|--------|-------|-------|
| Subject & Topic Management | ✅ Complete | 1 | CRUD operations working |
| Study Cycle UI | ⚠️ Partial | 1 | Visual gaps: no active card hierarchy, no cycle order indicators |
| Timer System | ⚠️ Partial | 1 | Legacy UI works, new dual-counter hooks built but disconnected |
| Theme & Subtopic Management | ⚠️ Partial | 1 | Models and creation forms built, not integrated into App.tsx |
| Battle System | ⚠️ Partial | 3 | Combat UI works, archiving pipeline had critical bug (fixed) |
| Confidence Scoring | ✅ Complete | 3 | Weight matrix implemented, room classification working |
| Spaced Repetition Engine | ⚠️ Partial | 3 | Ebbinghaus logic built, enemy return room assignment fixed |
| Enemy Archiving (Vencidos) | ⚠️ Partial | 3 | onArchiveEnemy trigger was broken — fix applied, needs validation |
| Statistics Page (7 dimensions) | ⚠️ Partial | 4 | Full page built in isolation, not integrated into App navigation |
| Time Statistics (legacy) | ✅ Complete | 4 | TimeStatsView working and accessible |
| Battle Statistics (legacy) | ✅ Complete | 4 | BattleStatsView working and accessible |
| Gamification (XP/HP/Stamina) | ✅ Complete | 2 | Working and integrated |
| Achievements System | ⚠️ Partial | 2 | UI exists, unlock triggers mostly unwired |
| Navigation System | ⚠️ Partial | 1 | Migrated from 8 boolean flags to activeView union type — needs validation |
| Data Import/Export | ⚠️ Partial | 5 | JSON import works, export is stub only |
| Empty State Handling | ⚠️ Partial | 1 | EmptyState component built, conditional render needs integration |
| Edit Mode (drag-and-drop) | ⚠️ Partial | 1 | Explicit Edit Mode built, needs integration |
| Auto-Cycle Visual Indicators | ⚠️ Partial | 1 | Connectors and mode badge built, needs integration |
| Cycle Progress Bar | ⚠️ Partial | 1 | Component built, not integrated into main view |

---

## Section 2 — Corrected overall completion estimate

Replace:
> **Overall completion:** ~75% (estimated)

With:
> **Overall completion:** ~45% (estimated — features built but unintegrated counted as Partial, not Complete)

*Reasoning for the correction:* The original 75% counted "built in isolation" as complete. The corrected estimate counts only features that are reachable from the UI and working end-to-end. The gap between built and integrated is the primary risk in the current codebase.

---

## Section 3 — Corrections to Phase 1

### Study Cycle View — correct from ✅ Complete to ⚠️ Partial

Replace the Study Cycle View entry with:

**Study Cycle View**
- Status: ⚠️ Partial
- Files: `src/components/CycleView.tsx`
- Description: Visual representation of the study cycle and progress.
- What works: Basic progress bars, subject listing, cycle detection.
- What is missing:
  - No visual hierarchy between active card and pending cards
  - No cycle order indicators (numbers 1, 2, 3 on cards)
  - No "Próxima Matéria" or "Em andamento" badge on active card
  - No left border accent color per subject
  - No explicit Edit Mode separating view from drag-and-drop
  - No Auto-Cycle visual connectors between cards
  - No Cycle Progress Bar (0% to 100% per rotation)
  - Empty State component built but not conditionally rendered
  - "Nova Matéria" card built but not integrated
- Blocks: Timer initiation with correct subject context.

### Add new entries to Phase 1 for built-but-unintegrated features

Add these entries after Study Cycle View:

**Theme & Subtopic Management**
- Status: ⚠️ Partial
- Files: `src/types/theme.types.ts`, `src/types/subjectCycle.types.ts`, `src/components/ThemeCreationForm.tsx`, `src/components/SubtopicAddForm.tsx`, `src/components/ThemeChecklist.tsx`, `src/components/SubtopicRow.tsx`
- Description: Complete content hierarchy below Subject level.
- What works: Data models fully defined, creation forms built, checklist interaction with 3 completion sources implemented.
- What is missing: Not integrated into SubjectDetailView in App.tsx. Adapter bridge (subjectToTheme.ts) created but not used in production.
- Blocks: useStudyTimer connection, dual progress indicators on SubjectCard.

**Subject Card (4-state visual hierarchy)**
- Status: ⚠️ Partial
- Files: `src/components/SubjectCard.tsx`, `src/components/SubjectList.tsx`
- Description: Card component handling Active/Pending/CycleCompleted/PermanentlyCompleted states with dual progress indicators.
- What works: All 4 states implemented, dual progress bars visible, retroactive compatibility with legacy Subject model via optional props.
- What is missing: Not replacing the existing card in CycleView/App.tsx. isPermanentlyCompleted prop requires Theme integration to compute correctly.
- Blocks: Nothing — can be integrated independently.

**Empty State Component**
- Status: ⚠️ Partial
- Files: `src/components/EmptyState.tsx`
- Description: Shown when subjects array is empty (post-onboarding only).
- What works: Component built with CTA button and correct copy.
- What is missing: Conditional render in parent not wired (if subjects.length === 0 → EmptyState, else → SubjectGrid).
- Blocks: Nothing — 1-line integration.

**Cycle Progress Bar**
- Status: ⚠️ Partial
- Files: `src/components/CycleProgressBar.tsx`
- Description: Shows current rotation completion (0% to 100%), celebration on completion, explicit reset confirmation.
- What works: Component fully built including celebration animation and "Reiniciar Ciclo" confirmation flow.
- What is missing: Not placed in main view layout. calculateCycleProgress not connected to live SubjectCycleState data.
- Blocks: Nothing — can be integrated independently.

**Auto-Cycle Visual Indicators**
- Status: ⚠️ Partial  
- Files: `src/components/AutoCycleIndicator.tsx` (or equivalent)
- Description: When isAutoCycle is ON, shows global mode badge and directional connectors between subject cards.
- What works: Mode indicator badge and card connectors built. Fade in/out animations on toggle implemented.
- What is missing: Not rendered in CycleView. isAutoCycle prop not passed to card layout component.
- Blocks: Nothing — requires isAutoCycle prop pass-through.

#### Updated Phase 1 completion: 2/8 features complete

---

## Section 4 — Corrections to Phase 3

### Battle System — correct from ✅ Complete to ⚠️ Partial

Replace the Battle System entry with:

**Battle System (Combat)**
- Status: ⚠️ Partial
- Files: `src/components/BattleView.tsx`, `src/components/BattleQuestionView.tsx`, `src/components/CombatView.tsx`, `src/components/ConfidenceSelector.tsx`, `src/components/ConfidenceSummary.tsx`
- Description: Gamified quiz interface where users fight enemies (topics).
- What works: Question presentation, health bars, damage calculation, confidence selection (certain/doubtful/guess), weighted score calculation, room classification after session.
- What is missing:
  - Enemy archiving pipeline had critical bug: onArchiveEnemy was not being called inside processSessionEnd when room = 'vencidos'. Fix applied — needs end-to-end validation.
  - ConfidenceSummary component built but integration with session end flow needs verification.
  - Error type classification (content/interpretation/distraction) built but needs validation in production flow.
- Blocks: Spaced repetition validation.

### Spaced Repetition Engine — correct from ✅ Complete to ⚠️ Partial

Replace the Spaced Repetition Engine entry with:

**Spaced Repetition Engine**
- Status: ⚠️ Partial
- Files: `src/utils/confidenceScoring.ts`, `src/utils/ebbinghaus.ts`
- Description: Calculates memory stability and schedules enemy returns.
- What works: Confidence-based weighted scoring, room classification thresholds (50/75), Ebbinghaus formula with personalized S value, progressive interval schedule (1→7→15→30 days), ArchivedEnemyCard with forgetting bar, VencidosPage with sort and returning section.
- What is missing:
  - archived_enemies table may not exist — SQL migration provided but not confirmed executed.
  - onArchiveEnemy trigger fix applied but not end-to-end validated.
  - contestDate integration with interval cap not tested.
  - Enemy return to Battle Field (auto-resurge on app launch) not confirmed working.
- Blocks: None — but requires validation pass.

#### Updated Phase 3 completion: 1/3 features complete
(Question Bank Management remains ✅ Complete)

---

## Section 5 — Corrections to Phase 4

### Add new Statistics Page entry

Add this entry to Phase 4 BEFORE the existing Time Statistics entry:

**Statistics Page (7 Dimensions)**
- Status: ⚠️ Partial
- Files: `src/components/StatsPage.tsx`, `src/components/stats/StatsGeral.tsx`, `src/components/stats/StatsBySubject.tsx`, `src/components/stats/StatsByTopic.tsx`, `src/components/stats/StatsConfidence.tsx`, `src/components/stats/StatsErrors.tsx`, `src/components/stats/StatsTimeTotal.tsx`, `src/components/stats/StatsTimePerQuestion.tsx`, `src/utils/statsCalculations.ts`
- Description: Full analytics page with 7 tabs, 4 automatic insights, and drill-down capability. Defaults to last 7 days.
- What works: All 7 tab components built. All pure utility functions implemented. 4 insight cards (metacognition index, blind spot, ideal battle duration, peak hour) implemented. onStartBattle CTA present. Export button stub with toast.
- What is missing: Not integrated into App.tsx navigation. No activeView entry for 'stats' in navigation system. BattleAttempt data source not connected to statsCalculations.
- Blocks: Nothing — requires navigation entry + data source wiring.

#### Updated Phase 4 completion: 2/3 features complete

---

## Section 6 — Corrections to Current State Summary

### Replace "What is fully working end-to-end" section

Replace with:

### What is fully working end-to-end
- **Subject & Topic Management:** User can create, edit, delete and reorder subjects and topics. Data persists in localStorage.
- **Legacy Focus Timer:** User can start a Pomodoro timer, hear ambient sounds, and record sessions that update XP and legacy cycle progress.
- **Battle System (core):** User can configure and run battles, answer questions with confidence levels, and see room classifications update.
- **Legacy Statistics:** User can view time distribution (donut chart) and battle history from existing TimeStatsView and BattleStatsView.
- **XP/HP/Stamina:** Gamification attributes update correctly after sessions and battles.

### Replace "What is built but not connected" section

Replace with:

### What is built but not connected

**Timer Architecture (new):**
- `useStudyTimer` — dual counter logic, built and tested in isolation
- `useAutoCycleTransition` — auto-advance countdown, built in isolation
- `useManualCycleDecision` — manual decision prompt, built in isolation
- All three require `subjectToTheme.ts` adapter to connect to legacy data
- None are imported by any rendered component

**Theme & Subtopic System:**
- `ThemeCreationForm` — built, not in SubjectDetailView
- `SubtopicAddForm` — built, not in SubjectDetailView  
- `ThemeChecklist` + `SubtopicRow` — built, not in any view
- `subjectToTheme.ts` adapter — built, not used in production

**Cycle View Enhancements:**
- `SubjectCard` (4-state) — built with backward compatibility, not replacing existing card in CycleView
- `EmptyState` — built, conditional render not wired in parent
- `CycleProgressBar` — built, not placed in main layout
- Auto-cycle visual connectors — built, not rendered in CycleView
- "Nova Matéria" card — built, not in subject grid
- Edit Mode toggle — built, drag-and-drop not gated behind it

**Battle Enhancements:**
- `ConfidenceSelector` — built with gated reveal, integration in BattleQuestionView needs verification
- `ConfidenceSummary` — built, session-end integration needs verification
- `ArchivedEnemyCard` + `VencidosPage` — built, archived_enemies data source needs validation

**Analytics:**
- `StatsPage` (full 7-tab) — built, not in App.tsx navigation
- `statsCalculations.ts` — all pure functions built, not connected to BattleAttempt data source

### Replace "What is visually present but logically broken" section

Replace with:

### What is visually present but logically broken

- **Achievements:** UI shows achievements list, unlock triggers mostly unwired across gameplay actions.
- **Enemy Archiving:** Battle flow correctly classifies rooms, but the trigger connecting room='vencidos' → onArchiveEnemy was broken. Fix was applied — end-to-end validation required.
- **Cycle visual states:** CycleView shows progress bars but all cards have equal visual weight — active card not visually distinguished from pending cards.
- **Initial data invariant:** constants.tsx had studiedMinutes > totalMinutes (1470 > 120 for Matemática) — fix applied, runtime guard added for development mode.
- **Type safety:** AppContext.Provider used `as any` cast — fix applied, needs TypeScript compilation verification.

---

## Section 7 — Corrections to Integration Checklist

Replace the existing Integration Checklist with:

```markdown
## Integration Checklist

### Cycle View — can be done independently, low risk
[ ] EmptyState → CycleView (parent conditional render)
      Requires: subjects.length === 0 check
      Effort: 1 line
      Outcome: Blank screen eliminated

[ ] SubjectCard (4-state) → CycleView (replace existing card)
      Requires: cycleState and themes props (use legacy fallback if unavailable)
      Effort: Small — backward compatible via optional props
      Outcome: Active/pending/completed visual hierarchy visible

[ ] CycleProgressBar → main view layout
      Requires: subjects array and onReset callback
      Effort: Small — standalone component
      Outcome: Rotation completion tracking visible

[ ] "Nova Matéria" card → subject grid (last position)
      Requires: onAddSubject callback
      Effort: Small
      Outcome: Quick subject addition without leaving context

[ ] Auto-Cycle indicators → CycleView
      Requires: isAutoCycle prop pass-through to card layout
      Effort: Small
      Outcome: Mode clearly communicated when isAutoCycle is ON

[ ] Edit Mode toggle → CycleView header
      Requires: editMode state gate on drag-and-drop handlers
      Effort: Medium
      Outcome: Accidental reordering eliminated

### Timer Architecture — requires adapter, medium risk
[ ] subjectToTheme adapter → FocusModeView (wire to hooks)
      Requires: subjectToTheme.ts already built
      Effort: Medium
      Outcome: New hooks can consume legacy Subject data

[ ] useStudyTimer → FocusModeView
      Requires: adapter wired first
      Effort: Medium — run alongside legacy timer until validated
      Outcome: Dual-counter timer active (cycleTime + themeTime)

[ ] useAutoCycleTransition → FocusModeView (isAutoCycle=true)
      Requires: useStudyTimer connected first
      Effort: Medium
      Outcome: Countdown and advance flow on cycle goal reached

[ ] useManualCycleDecision → FocusModeView (isAutoCycle=false)
      Requires: useStudyTimer connected first
      Effort: Medium
      Outcome: Decision prompt on cycle goal reached

### Theme System — requires data model work, high risk
[ ] ThemeCreationForm → SubjectDetailView
      Requires: onThemeCreated handler in parent
      Effort: Medium
      Outcome: Users can add themes to subjects

[ ] SubtopicAddForm → ThemeDetailView (or SubjectDetailView)
      Requires: ThemeCreationForm integrated first
      Effort: Small once parent exists
      Outcome: Subtopics addable to existing themes

[ ] ThemeChecklist → ThemeDetailView
      Requires: Theme data accessible in view
      Effort: Medium
      Outcome: Checklist with 3 completion sources active

[ ] isSubjectCompleted → SubjectCard.isPermanentlyCompleted
      Requires: Theme array accessible per subject
      Effort: Small
      Outcome: Permanently completed subjects move to archived section

### Battle Enhancements — validation required
[ ] ConfidenceSelector gated reveal → BattleQuestionView
      Requires: Verify confidence is collected before reveal
      Effort: Validation + small fix if needed
      Outcome: Metacognition data is honest

[ ] onArchiveEnemy trigger → processSessionEnd
      Requires: Fix already applied — validate end-to-end
      Effort: Testing pass
      Outcome: Enemies correctly move to Vencidos at score >= 75

[ ] archived_enemies table → database
      Requires: SQL migration execution
      Effort: Small — run CREATE TABLE IF NOT EXISTS
      Outcome: VencidosPage has a real data source

### Analytics — requires navigation entry
[ ] StatsPage → App.tsx navigation
      Requires: Add 'stats' to ActiveView union type
      Effort: Small — add navigation entry + route condition
      Outcome: Statistics accessible from main screen

[ ] BattleAttempt data → statsCalculations
      Requires: StatsPage integrated in navigation first
      Effort: Medium — wire BattleAttempt array from AppContext
      Outcome: All 7 statistical dimensions show real data
```

---

## Section 8 — Corrections to Technical Debt table

Replace the existing Technical Debt table with:

| Debt Item | Severity | Blocks | Status |
|-----------|----------|--------|--------|
| Two parallel data models (Subject vs Theme) | High | Timer hooks integration, Theme UI | Active |
| StudyContext.tsx — dead code duplicate of FocusModeView | Low | Confusion during refactor | Fix applied — needs deletion confirmed |
| Boolean navigation flags (8 flags → activeView) | Medium | View overlap bugs | Fix applied — needs validation |
| `as any` in AppContext.Provider | Critical | TypeScript type safety | Fix applied — needs compilation check |
| studiedMinutes > totalMinutes in constants.tsx | Critical | Progress bar overflow | Fix applied — runtime guard added |
| handleTimerComplete not in useCallback | High | Session duplication in StrictMode | Fix applied — needs validation |
| secondsLeft > 0 boolean in useEffect deps | High | Timer freeze/skip | Fix applied — needs validation |
| async functions on synchronous localStorage ops | Low | Misleading async signatures | Fix applied — call sites updated |
| Tailwind via CDN (not PostCSS pipeline) | High | Production bundle size, tree-shaking | Fix applied — needs build verification |
| localStorage capacity limit (~5MB) | Medium | Data loss at scale | Known — deferred to Cloud Sync phase |

---

## Section 9 — Corrected Next Development Priorities

Replace existing priorities with:

### Priority 1 — Validate all applied fixes (regression check)
**Why now:** Six critical and high-severity bugs had fixes applied in the last development session. None have been validated end-to-end. If fixes introduced regressions, they block everything else.
**Depends on:** Nothing — validation only.
**Unblocks:** Everything.
**Estimated scope:** Small (1-2 prompts)
**What to verify:**
- TypeScript compiles with zero errors after `as any` removal
- Timer does not duplicate sessions in StrictMode
- Timer counts down every second without freezing
- Progress bars do not overflow 100%
- Tailwind classes render correctly via PostCSS
- Navigation shows only one view at a time

### Priority 2 — Integrate Cycle View enhancements (low risk)
**Why now:** Five standalone components are built and ready. Integration is low-risk (backward compatible, no data model changes). Each integration is independent and small.
**Depends on:** Priority 1 validation.
**Unblocks:** Users experience the designed cycle hierarchy.
**Estimated scope:** Small (2-3 prompts)
**Components to integrate:** EmptyState, SubjectCard (4-state), CycleProgressBar, Auto-Cycle indicators, Edit Mode toggle.

### Priority 3 — Validate battle archiving pipeline
**Why now:** The onArchiveEnemy bug fix was applied but the pipeline has never been tested end-to-end with a real battle session reaching weightedScore >= 75.
**Depends on:** Priority 1 validation.
**Unblocks:** Spaced repetition system working correctly.
**Estimated scope:** Small (1 prompt — diagnostic + fix if needed)
**What to verify:** Run battle → reach 75+ score → enemy appears in VencidosPage → disappears from Battle Field rooms.

### Priority 4 — Integrate StatsPage into navigation
**Why now:** The full statistics page is built and waiting. Integration requires only adding 'stats' to ActiveView and wiring the BattleAttempt data source.
**Depends on:** Priority 1 (navigation validation).
**Unblocks:** Users can access their performance data.
**Estimated scope:** Small (1-2 prompts)

### Priority 5 — Connect Timer Architecture (new hooks)
**Why now:** The largest architectural gap — new hooks are fully built but orphaned. The adapter bridge exists. This is the highest value unblocked work after the quick wins above.
**Depends on:** Priorities 1-2 (stable base).
**Unblocks:** Dual-counter tracking, auto-transitions, manual decisions, Theme progress tracking.
**Estimated scope:** Large (5-8 prompts)

---

## Section 10 — Corrected Phase Transition Criteria

Replace existing criteria with:

### Phase 1 is complete when:
- [ ] Cycle View shows visual hierarchy (active card distinguished)
- [ ] Empty State renders when subjects array is empty
- [ ] Edit Mode explicitly gates drag-and-drop
- [ ] Cycle Progress Bar visible and tracking rotation completion
- [ ] Theme creation accessible from Subject detail view
- [ ] useStudyTimer connected and dual counters working in FocusModeView

### Phase 2 is complete when:
- [ ] Achievements unlock dynamically from all relevant gameplay events
- [ ] Auto-cycle transition (countdown) works end-to-end
- [ ] Manual cycle decision prompt works end-to-end

### Phase 3 is complete when:
- [ ] Enemy archiving validated end-to-end (battle → Vencidos)
- [ ] Enemy return to Battle Field validated (date trigger → Alerta room)
- [ ] Confidence-weighted scoring confirmed in production battle flow

### Phase 4 is complete when:
- [ ] StatsPage accessible from main navigation
- [ ] All 7 statistical dimensions show real BattleAttempt data
- [ ] 4 automatic insights compute correctly from real data

---

## Merge Instructions

To apply this patch to the main `GLOBAL.md`:

1. Replace the Product Map table (Section 1 of this patch)
2. Replace the overall completion estimate (Section 2)
3. Replace Phase 1 features section (Section 3)
4. Replace Phase 3 features section (Section 4)
5. Add Statistics Page entry to Phase 4 (Section 5)
6. Replace all three Current State Summary subsections (Section 6)
7. Replace the Integration Checklist entirely (Section 7)
8. Replace the Technical Debt table (Section 8)
9. Replace Next Development Priorities entirely (Section 9)
10. Replace Phase Transition Criteria (Section 10)
11. Update last-updated date to today

After merging, re-read the complete document and verify:
- No feature is marked ✅ Complete unless it passes the 4-question test
- Integration checklist covers every built-but-unconnected module
- Priority order follows dependency chain (no priority depends on a later priority)
- Overall completion percentage is honest
