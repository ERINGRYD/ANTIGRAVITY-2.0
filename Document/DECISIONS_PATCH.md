# Architectural Decisions Patch

This file contains architectural and product decisions that supplement the existing `DECISIONS.md` document. 

---

## ADR-010 — Exact weight matrix values for confidence scoring

**Status:** Accepted  
**Category:** Scoring  

**Context:**
The confidence scoring system needs specific numeric weights for each of the 6 result+confidence combinations. These values determine how aggressively the system penalizes misconceptions and rewards mastery.

**Decision:**
The following weight matrix was explicitly defined and must never be changed without a new ADR:
- correct + certain   =  1.0  (confirmed mastery)
- correct + doubtful  =  0.6  (partial knowledge)
- correct + guess     =  0.2  (luck — does not indicate mastery)
- wrong   + certain   = -0.5  (dangerous misconception — penalized)
- wrong   + doubtful  =  0.0  (expected gap — neutral)
- wrong   + guess     =  0.1  (expected result — near neutral)

**Reasoning:**
- wrong+certain receives the largest penalty (-0.5) because a user who answers incorrectly with full confidence has a misconception — they believe something false is true. This is methodologically more dangerous than simply not knowing, because it requires active unlearning.
- correct+guess scores low (0.2) because a correct guess provides no evidence of mastery and should not advance the user toward Vencidos.

**Alternatives Rejected:**
- Equal weights for all correct answers — rejected because it fails to distinguish mastery from luck.
- Positive penalty for wrong+certain — considered but rejected because the system should penalize false confidence, not just wrong answers.

**Consequences:**

Positive:
- Highly accurate representation of true user mastery.
- Actively discourages guessing and false confidence.

Negative / Trade-offs:
- Users may feel frustrated when a wrong+certain answer significantly drops their score.

**Affected Files:**
- `src/utils/confidenceScoring.ts` — Implements the exact weight matrix.

---

## ADR-011 — Room classification thresholds using weighted score

**Status:** Accepted  
**Category:** Scoring  

**Context:**
The original room classification used pure accuracy with thresholds of 70% (Crítica→Alerta) and 85% (Alerta→Vencidos). The new system uses weighted score which is naturally more conservative.

**Decision:**
Room classification thresholds were lowered to:
- `questionsAnswered === 0`       → Reconhecimento
- `weightedScore < 50`            → Crítica
- `weightedScore >= 50 and < 75`  → Alerta
- `weightedScore >= 75`           → Vencidos

These thresholds apply to `weightedScore` (0-100), NOT to pure accuracy.

**Reasoning:**
- Thresholds are lower (50/75 instead of 70/85) because weighted score is naturally more conservative than pure accuracy. 
- A user guessing correctly inflates accuracy but not weighted score. 
- Reaching 75 weighted requires consistent mastery (correct+certain answers), not just correct answers by any means.

**Alternatives Rejected:**
- Keeping 70/85 thresholds with weighted score — rejected because it is too strict; a user with genuine mastery but occasional doubtful answers would never reach Vencidos.
- Using pure accuracy for thresholds — rejected because it fails to distinguish mastery from systematic guessing.

**Consequences:**

Positive:
- Room progression directly reflects metacognitive mastery, not just luck.

Negative / Trade-offs:
- Users transitioning from the old system might find it harder to reach Vencidos if they rely on guessing.

**Affected Files:**
- `src/utils/confidenceScoring.ts` — Defines the thresholds.
- `classifyEnemyRoom()` — Implements the classification logic.

---

## ADR-012 — Confidence must be collected BEFORE answer reveal

**Status:** Accepted  
**Category:** Session Flow  

**Context:**
The UX flow for confidence selection could be placed before or after the answer is revealed. The order has a significant impact on data quality.

**Decision:**
Confidence is always collected AFTER the user selects their answer but BEFORE the system reveals whether the answer is correct.
The answer reveal is gated — it only happens after confidence is selected. Skipping confidence selection is not allowed.

**Reasoning:**
- Collecting confidence after reveal would make the declaration retrospective and dishonest (hindsight bias) — users would always say "certain" for correct answers and "guess" for wrong ones, making the data useless for metacognition measurement.

**Alternatives Rejected:**
- Collecting after reveal — rejected because it produces dishonest data.
- Making confidence selection optional — rejected because it creates gaps in the mastery data required for the Ebbinghaus algorithm.

**Consequences:**

Positive:
- Guarantees high-quality, honest metacognitive data.

Negative / Trade-offs:
- Adds an extra click (friction) to every question answered.

**Affected Files:**
- `src/components/ConfidenceSelector.tsx` — Renders the selection UI.
- `src/views/BattleQuestionView.tsx` — Enforces the gated flow.

---

## ADR-013 — Two independent time counters running simultaneously

**Status:** Accepted  
**Category:** Timer  

**Context:**
The study system needs to track both cycle balance (ensuring equal dedication to all subjects) and theme content progress (measuring how close a tema is to completion). These have fundamentally different rules and must not be conflated.

**Decision:**
Every study session feeds TWO independent counters simultaneously:

Counter 1 — Cycle Time (`SubjectCycleState.currentCycleTime`):
- Counts up to `cycleGoalTime` then stops (capped).
- Resets to zero at the start of every new cycle rotation.
- Excess time beyond goal recorded separately as `excessTime`.
- Purpose: ensure no matéria is over or under-studied per rotation.

Counter 2 — Theme Accumulated Time (`Theme.accumulatedTime`):
- Never stops counting — excess beyond cycle goal still accumulates.
- Never resets — carries across all rotations until tema is completed.
- Purpose: track content progress toward tema completion.

**Reasoning:**
- A single timer cannot serve both purposes. Cycle time needs a hard cap to enforce study balance. 
- Theme time needs to be uncapped to reflect real content progress regardless of rotation boundaries.

**Alternatives Rejected:**
- Single timer for both — rejected because it cannot simultaneously enforce cycle balance AND track content progress without one corrupting the other.
- Theme time resetting each rotation — rejected because it loses accumulated progress across rotations, making long temas impossible to complete.

**Consequences:**

Positive:
- Accurately tracks both rotation discipline and content mastery.

Negative / Trade-offs:
- Increases the complexity of the timer state management and data model.

**Affected Files:**
- `src/types/subjectCycle.types.ts` — Defines the dual counters.
- `src/hooks/useStudyTimer.ts` — Manages the ticking logic.
- `src/utils/applyTimeIncrement.ts` — Routes time to the correct counters.

---

## ADR-014 — Excess time handling after cycle goal is reached

**Status:** Accepted  
**Category:** Timer  

**Context:**
When a user reaches the cycle goal time for a matéria but continues studying (because a tema is incomplete), time continues to flow. The system must decide what to do with this excess time.

**Decision:**
Time studied beyond `cycleGoalTime` is:
- Recorded as `excessTime` in `SubjectCycleState` (separate field).
- Does NOT count toward the next rotation's `cycleGoalTime` baseline.
- DOES continue accumulating toward `Theme.accumulatedTime`.
- The cycle is considered rotation-complete the moment the goal is reached, regardless of how much excess time accumulates.

**Reasoning:**
- `excessTime` must not affect the next rotation because the entire purpose of cycle time is to enforce balance across subjects. If excess carries forward, users who over-study one matéria would have an unfair advantage in the next rotation. 
- `Theme.accumulatedTime` continues because the user is genuinely studying content — that progress should not be discarded.

**Alternatives Rejected:**
- Excess counts toward next rotation goal — rejected because it defeats the purpose of cycle balance enforcement.
- Excess discarded entirely — rejected because it penalizes users who choose to finish a tema, and loses real study time from theme progress tracking.

**Consequences:**

Positive:
- Maintains strict cycle discipline while rewarding extra effort on content.

Negative / Trade-offs:
- Requires tracking an additional `excessTime` field.

**Affected Files:**
- `src/types/subjectCycle.types.ts` — Adds the `excessTime` field.
- `src/utils/applyTimeIncrement.ts` — Handles the overflow logic.

---

## ADR-015 — Subject permanent completion vs cycle rotation completion

**Status:** Accepted  
**Category:** Data Model  

**Context:**
A matéria can be "done" in two fundamentally different senses that must not be confused in the UI or data model.

**Decision:**
Two distinct completion states exist and must always be treated separately:

Cycle Rotation Completion (temporary):
- Criterion: `currentCycleTime >= cycleGoalTime` for this rotation.
- Meaning: "I studied enough of this matéria this round".
- Consequence: matéria moves to end of cycle queue.
- Resets: at the start of every new rotation.
- Visual: "META ATINGIDA" badge.

Subject Permanent Completion (permanent):
- Criterion: ALL temas of the matéria have `isCompleted === true`.
- Meaning: "I have mastered all content of this matéria".
- Consequence: matéria is removed from cycle permanently.
- Resets: never.
- Visual: "MATÉRIA CONCLUÍDA" badge, matéria moves to archived section.

**Reasoning:**
- Conflating these two states would either remove subjects from the cycle too early (treating rotation completion as permanent) or never remove them (treating permanent completion as just another rotation). 
- The distinction is the core of the cycle methodology.

**Alternatives Rejected:**
- Single completion state — rejected because it breaks the fundamental mechanics of a study cycle.

**Consequences:**

Positive:
- Clear separation between daily goals and long-term mastery.

Negative / Trade-offs:
- Requires careful UI design to ensure users understand the difference between the two badges.

**Affected Files:**
- `src/types/subjectCycle.types.ts` — Tracks rotation completion.
- `src/utils/isSubjectCompleted.ts` — Computes permanent completion.
- `src/components/SubjectCard.tsx` — Renders the distinct visual states.

---

## ADR-016 — Theme completion sources and their distinct behaviors

**Status:** Accepted  
**Category:** Data Model  

**Context:**
A tema can be completed through three different mechanisms, each with different evidence strength and different side effects.

**Decision:**
Three completion sources are defined with distinct behaviors:

`time`: `Theme.accumulatedTime >= Theme.goalTime`
- Automatic — no user action required.
- Awards XP normally.
- Can be superseded by checklist if all subtopics are also complete.

`checklist`: All subtopics have `isCompleted === true`
- Manual — requires user to mark subtopics.
- Awards XP normally.
- If a new incomplete subtopic is added, tema reverts to incomplete.

`manual-known`: User declares prior knowledge before studying
- Applied to subtopics, not temas directly.
- Does NOT award XP — user did not study, only declared knowledge.
- Must be visually distinct from other completed subtopics.
- User can revert this declaration.

`questions` (future):
- Read-only — set automatically by question resolution.
- Cannot be manually reverted.
- Structure present in model but not yet functionally implemented.

**Reasoning:**
- Different completion sources have different evidence strength for mastery. 
- A tema completed by time means the user invested effort. A subtopic marked as `manual-known` means the user claims prior knowledge but has not demonstrated it — awarding XP here would inflate progress metrics dishonestly.

**Alternatives Rejected:**
- Single completion boolean — rejected because it loses context of *how* it was completed.
- Awarding XP for manual-known — rejected because it creates a loophole for dishonest progression.

**Consequences:**

Positive:
- Accurate XP economy and rich data on user learning habits.

Negative / Trade-offs:
- Complex completion resolution logic.

**Affected Files:**
- `src/types/theme.types.ts` — Defines `completionSource`.
- `src/components/ThemeChecklist.tsx` — Handles manual completions.
- `src/components/SubtopicRow.tsx` — Handles `manual-known` state.

---

## ADR-017 — isAutoCycle toggle controls both subject AND theme selection

**Status:** Accepted  
**Category:** Session Flow  

**Context:**
The `isAutoCycle` toggle originally controlled only automatic matéria advancement. When temas were introduced as a sub-level within matérias, a decision was needed about whether tema selection would also be automated.

**Decision:**
The `isAutoCycle` toggle controls TWO levels of automation simultaneously:

`isAutoCycle` ON (Guided Mode):
- System selects which matéria to study.
- System selects which tema within that matéria (first pending tema).
- User only studies — all navigation decisions are eliminated.
- Maximum reduction of decision fatigue.

`isAutoCycle` OFF (Manual Mode):
- User decides when to advance matérias.
- User selects which tema to study before session starts.
- System only measures time and progress.
- Maximum user control.

**Reasoning:**
- Using the same toggle for both levels creates a consistent mental model: "auto = system decides everything, manual = I decide everything."
- Adding a separate toggle for tema selection would create 4 combinations (2 toggles × 2 states) where only 2 are meaningful, creating confusion.

**Alternatives Rejected:**
- Separate toggle for theme selection — rejected because it creates confusing combinations.
- Theme always auto-selected regardless of toggle — rejected because it removes control from manual mode users who may want to choose their study focus.

**Consequences:**

Positive:
- Simple, binary UX that caters to two distinct user personas (guided vs. self-directed).

Negative / Trade-offs:
- Less granular control for power users who might want auto-subject but manual-theme.

**Affected Files:**
- `src/utils/resolveNextSubject.ts` — Implements the routing logic.
- `src/hooks/useAutoCycleTransition.ts` — Handles guided mode.
- `src/hooks/useManualCycleDecision.ts` — Handles manual mode.

---

## ADR-018 — Behavior when cycle goal is reached with incomplete theme

**Status:** Accepted  
**Category:** Session Flow  

**Context:**
When a user reaches the cycle goal time for a matéria but the active tema is not yet complete, the system faces a conflict: the cycle wants to advance, but the content is unfinished.

**Decision:**
The resolution differs by mode:

Auto-cycle mode:
1. Wait for current Pomodoro session to complete naturally.
2. Show warning: "Theme X incomplete — advancing in Ns".
3. Start 10-second countdown (user can cancel).
4. On countdown completion: advance to next matéria.
5. Tema resumes in the next rotation from where it stopped.

Manual mode:
1. Show decision prompt immediately (no countdown).
2. Prompt: "Continue on current theme OR change subject?".
3. No auto-dismiss — user must explicitly choose.
4. If user chooses to continue: session continues, time accumulates as `excessTime` for cycle, normally for tema.
5. If user chooses to change: session ends, tema resumes next rotation.

**Reasoning:**
- Auto-cycle users chose automation — interrupting them with a mandatory decision contradicts their mode choice. A countdown with cancel option respects automation while giving users an escape.
- Manual-cycle users chose control — auto-advancing without their input would violate their mode contract. A mandatory choice prompt (no dismiss button) forces a conscious decision.

**Alternatives Rejected:**
- Same behavior for both modes — rejected because it violates the contract of the chosen mode.

**Consequences:**

Positive:
- Respects user intent and mode selection perfectly.

Negative / Trade-offs:
- Requires maintaining two divergent transition flows.

**Affected Files:**
- `src/hooks/useAutoCycleTransition.ts` — Implements auto flow.
- `src/hooks/useManualCycleDecision.ts` — Implements manual flow.
- `src/components/TransitionOverlay.tsx` — Renders the countdown.
- `src/components/DecisionPrompt.tsx` — Renders the manual choice.

---

## ADR-019 — Pomodoro completion gates auto-cycle transition countdown

**Status:** Accepted  
**Category:** Session Flow  

**Context:**
In auto-cycle mode, the 10-second countdown before advancing to the next matéria could start immediately when the cycle goal is reached, or it could wait for the current Pomodoro session to end.

**Decision:**
The countdown only starts AFTER the current Pomodoro session is complete.
If the Pomodoro is still running when `cycleGoalTime` is reached, the system enters 'waiting-pomodoro' phase and waits silently.

**Reasoning:**
- A Pomodoro session represents a discrete unit of focused work. Interrupting it mid-session to advance matérias would break the user's focus cycle, which is the primary study mechanism. 
- The cycle goal and the Pomodoro are two independent rhythms — the cycle goal signals "enough time invested" but should not override the focus unit.

**Alternatives Rejected:**
- Advance immediately on goal reached — rejected because it interrupts focus sessions.
- Ignore Pomodoro entirely — rejected because it makes the Pomodoro system irrelevant during cycle transitions.

**Consequences:**

Positive:
- Protects the user's flow state and focus.

Negative / Trade-offs:
- Cycle time will naturally exceed goal time frequently, requiring robust `excessTime` handling.

**Affected Files:**
- `src/hooks/useAutoCycleTransition.ts` — Uses `isPomodoroComplete` to gate the transition.

---

## ADR-020 — Memory stability estimated from first battle accuracy

**Status:** Accepted  
**Category:** Spaced Repetition  

**Context:**
The Ebbinghaus formula requires a memory stability value (S) for each user-topic pair. This value determines how fast the forgetting curve decays. It must be initialized somehow on first defeat.

**Decision:**
Memory stability (S) is estimated from the accuracy of the first battle against that topic:
- `accuracyRate >= 85%` → S = 20 (slow forgetting — strong mastery)
- `accuracyRate >= 70%` → S = 12 (medium forgetting)
- `accuracyRate >= 50%` → S = 7  (fast forgetting — weak mastery)
- `accuracyRate < 50%`  → S = 4  (very fast forgetting — minimal mastery)

On subsequent battles, S is refined using weighted average:
`newS = (battleS × 0.6) + (currentS × 0.4)`
Recent performance is weighted at 60%, history at 40%.

**Reasoning:**
- S cannot be a universal constant because different users learn different topics at different rates. 
- Estimating from first battle accuracy makes the system immediately personalized without requiring a calibration period. 
- The weighted refinement ensures S converges toward the user's true retention rate over time.

**Alternatives Rejected:**
- Universal S for all users — rejected because it ignores individual learning differences.
- Calibration period (N battles before estimating) — rejected because it delays personalization and feels broken to new users.

**Consequences:**

Positive:
- Immediate, personalized spaced repetition curves.

Negative / Trade-offs:
- The first battle heavily anchors the curve, which might be inaccurate if the user was just having a bad day.

**Affected Files:**
- `src/utils/ebbinghaus.ts` — Contains the formulas.
- `estimateMemoryStability()` — Implements the initial estimation.
- `refineMemoryStability()` — Implements the weighted update.

---

## ADR-021 — Defeated enemy return room assignment

**Status:** Accepted  
**Category:** Spaced Repetition  

**Context:**
When an archived enemy returns from the Vencidos page to the Battle Field, it needs to be placed in a room. The room assignment signals to the user how to approach the returning enemy.

**Decision:**
Returning enemies ALWAYS enter the Alerta (amber) room, regardless of their previous room or time since archiving.
They never enter Reconhecimento or Crítica on return.

Post-return battle outcomes:
- `weightedScore >= 75`: → Vencidos again (re-archived)
- `weightedScore 50-74`: → stays in Alerta
- `weightedScore < 50`:  → moves to Crítica
- User loses battle:   stays in Battle Field, difficulty does not reset

**Reasoning:**
- Reconhecimento would be incorrect — the user has studied this topic before. 
- Crítica would be unfairly punishing — the user mastered it previously. 
- Alerta signals "you knew this, let's verify you still do" which accurately represents the returning enemy's status.

**Alternatives Rejected:**
- Return to Crítica — rejected because it is too punitive for previously mastered content.
- Return to Reconhecimento — rejected because it ignores prior mastery history.
- Return to previous room before archiving — rejected because it loses the semantic meaning of rooms as current mastery state.

**Consequences:**

Positive:
- Fair and semantically accurate placement for review sessions.

Negative / Trade-offs:
- None identified.

**Affected Files:**
- `src/utils/onArchiveEnemy.ts` — Handles the return logic.
- Battle Field room filters — Ensure returning enemies route to Alerta.

---

## ADR-022 — Spaced repetition interval schedule and post-5th behavior

**Status:** Accepted  
**Category:** Spaced Repetition  

**Context:**
The spaced repetition system needs defined intervals for how long an archived enemy waits before returning. After enough repetitions, a stable interval must be defined.

**Decision:**
Intervals follow a progressive schedule:
- 1st return: 1 day
- 2nd return: 7 days
- 3rd return: 15 days
- 4th return: 30 days
- 5th return and beyond: 30 days (fixed), repeating until contest date

If `contestDate` is set and the calculated next return date would exceed the contest date, `nextReturnDate` is capped at `contestDate`.
The interval never increases beyond 30 days because the contest deadline makes longer intervals counterproductive.

**Reasoning:**
- Intervals follow Ebbinghaus-aligned spacing (roughly 1→7→15→30).
- After the 5th return, 30-day intervals ensure the user reviews every mastered topic at least once per month until the exam.
- The contest date cap prevents scheduling reviews after the exam would have already occurred.

**Alternatives Rejected:**
- Continuing to double intervals (60, 120, 240 days) — rejected because intervals become longer than the time until most exams, making the system useless for exam-focused students.
- Fixed interval from start — rejected because it removes the progressive nature of spaced repetition.

**Consequences:**

Positive:
- Highly practical for exam preparation timelines.

Negative / Trade-offs:
- Less efficient for lifelong learning without a deadline (where 60/120 day intervals are optimal).

**Affected Files:**
- `src/utils/calculateNextInterval.ts` — Implements the schedule.
- `src/utils/calculateNextReturnDate.ts` — Applies the contest cap.
- `ArchivedEnemy.contestDate` — Data model support.

---

## ADR-023 — Forgetting curve bar is always computed, never stored

**Status:** Accepted  
**Category:** Data Model  

**Context:**
The visual "Força de Retorno" bar represents the current forgetting percentage for an archived enemy. It could be stored as a field or computed on render.

**Decision:**
`barValue` is ALWAYS recalculated on every render using:
`barValue = (1 - e^(-daysSinceVictory / S)) × 100`

It is never stored in the database or state.
Similarly, `calculateCurrentQuestions` and `calculateCurrentDifficulty` are always computed on render, never stored.

Only these values are persisted:
- `memoryStability` (S)
- `returnCount`
- `lastVictoryDate`
- `nextReturnDate`
- `baseQuestions` (base value, not the daily-computed current value)

**Reasoning:**
- Storing `barValue` would create a stale value the moment it is read — it changes every day. 
- Computing from first principles ensures the value is always accurate to the current moment. 
- The formula is cheap to compute and has no side effects.

**Alternatives Rejected:**
- Storing and updating via cron job — rejected because it is over-engineered and prone to sync issues in a client-heavy app.

**Consequences:**

Positive:
- Always accurate, simpler state management.

Negative / Trade-offs:
- Slight CPU overhead on render (negligible in practice).

**Affected Files:**
- `src/utils/ebbinghaus.ts` — Contains the pure functions.
- `src/components/ArchivedEnemyCard.tsx` — Calls `calculateBarValue()` on render.

---

## ADR-024 — Two parallel data models coexist during migration

**Status:** Accepted  
**Category:** Data Model  

**Context:**
The application was built with a legacy data model (Subject/Topic in `types.ts`). New features required a more expressive model (Theme/SubjectCycleState in `theme.types.ts` and `subjectCycle.types.ts`). A full immediate migration would break the existing working features.

**Decision:**
Both models coexist temporarily with a bridge adapter:
- Legacy model (Subject/Topic): source of truth for `App.tsx`, `FocusModeView`, and all currently working features.
- New model (Theme/SubjectCycleState): used by new hooks only.
- Bridge adapter (`subjectToTheme.ts`): converts legacy → new model for consumption by new hooks, without modifying legacy data.

The legacy model remains the source of truth until migration is complete. New hooks receive converted data via the adapter.

**Reasoning:**
- Big-bang migration would break all working features simultaneously.
- The adapter allows new hooks to be developed and tested against real data without requiring a full migration first. Once new hooks are validated, the migration can be done incrementally.

**Alternatives Rejected:**
- Immediate full migration — rejected because it is too risky and breaks all working features.
- Rewriting new hooks to use legacy model — rejected because the legacy model lacks the expressiveness needed (no `accumulatedTime`, no `completionSource`).

**Consequences:**

Positive:
- Safe, incremental migration path.

Negative / Trade-offs:
- Technical debt and risk of model confusion during the transition period.

**Affected Files:**
- `src/adapters/subjectToTheme.ts` — The bridge adapter.
- `src/types/types.ts` — Legacy models.
- `src/types/theme.types.ts` & `src/types/subjectCycle.types.ts` — New models.

---

## ADR-025 — Subject permanent completion is derived, never stored

**Status:** Accepted  
**Category:** Data Model  

**Context:**
A matéria is permanently complete when all its temas are complete. This could be stored as a boolean field on Subject or computed.

**Decision:**
`isPermanentlyCompleted` is ALWAYS derived by calling `isSubjectCompleted(themes)` — it is never stored as a field on Subject.

Formula: `isSubjectCompleted = themes.length > 0 AND ALL themes have isCompleted === true`

An empty themes array returns false — a matéria with no temas is never considered permanently complete.

**Reasoning:**
- Storing this value creates a synchronization risk — the stored value could become stale if a tema's `isCompleted` status changes. 
- Deriving it ensures it always reflects the real state of the themes array.

**Alternatives Rejected:**
- Storing as `Subject.isCompleted` field — rejected because it creates sync issues when temas are added, removed, or their completion status changes.

**Consequences:**

Positive:
- Single source of truth, impossible to have desynchronized completion states.

Negative / Trade-offs:
- Requires passing the themes array to compute the status.

**Affected Files:**
- `src/utils/isSubjectCompleted.ts` (or within `theme.types.ts`) — The pure derivation function.
- `src/components/SubjectCard.tsx` — Uses the derived prop.

---

## ADR-026 — Navigation via single activeView union type

**Status:** Accepted  
**Category:** Navigation  

**Context:**
The original navigation used 8 independent boolean flags (`isTimeStatsView`, `isManagementView`, etc.) which could be true simultaneously, causing view overlap and making the navigation state impossible to reason about.

**Decision:**
Navigation is controlled by a single `activeView` state of type `ActiveView` (union type) plus a separate `activeModal` state.

```typescript
type ActiveView = 'main' | 'timeStats' | 'notifications' | 
  'history' | 'achievements' | 'management' | 'goalsManagement' |
  'battleSelection' | 'importJson'
```

Only one view can be active at a time — physically impossible to have two views visible simultaneously.

**Reasoning:**
- A union type makes invalid states unrepresentable. With boolean flags, the state (`isManagementView=true`, `isHistoryView=true`) is valid TypeScript but invalid product behavior. The union type eliminates this entire class of bugs.

**Alternatives Rejected:**
- React Router — rejected because it adds a routing library dependency, which is overkill for current navigation complexity.
- Keeping boolean flags — rejected because it allows multiple views simultaneously, requiring defensive AND logic in every render condition.

**Consequences:**

Positive:
- Bulletproof navigation state, impossible to render overlapping views.

Negative / Trade-offs:
- Requires mapping old boolean logic to new union logic during refactoring.

**Affected Files:**
- `src/App.tsx` — Implements the union state.
- `src/types/navigation.types.ts` — Defines the `ActiveView` type.

---

## ADR-027 — Memory stability uses combined accuracy+weighted score

**Status:** Accepted  
**Category:** Scoring  

**Context:**
When estimating memory stability for the Ebbinghaus formula, the system could use pure accuracy, weighted score, or a combination.

**Decision:**
Memory stability estimation uses a combined score:
`combinedScore = (accuracyRate × 0.4) + (weightedScore × 0.6)`

Weighted score receives higher weight (60%) because it better reflects true mastery than pure accuracy. Pure accuracy is included (40%) to prevent extreme cases where weighted score is distorted by a single wrong+certain answer.

**Reasoning:**
- A user who answers 10/10 correct but all by guess has 100% accuracy but low weighted score. Their memory stability should be low because they demonstrated no actual mastery. 
- Weighting weighted score more heavily ensures the forgetting curve is faster for lucky performers.

**Alternatives Rejected:**
- Pure accuracy — rejected because it rewards guessing.
- Pure weighted score — rejected because it is too volatile for small sample sizes.

**Consequences:**

Positive:
- Highly accurate retention modeling that accounts for metacognition.

Negative / Trade-offs:
- Complex formula that is difficult to explain to users.

**Affected Files:**
- `src/utils/estimateMemoryStabilityWithConfidence.ts` — Implements the formula.
- `src/utils/onArchiveEnemy.ts` — Calls the estimator.

---

## ADR-008 Amendment — Tailwind CSS delivery method

The original ADR-008 documented Tailwind CSS as a positive decision.
This amendment corrects the record:

**Amendment:** The initial implementation loaded Tailwind via CDN (`cdn.tailwindcss.com`), which is not suitable for production. This was identified as a critical bug and corrected.

**Corrected state:** Tailwind is now installed via npm and processed through the Vite/PostCSS pipeline with proper tree-shaking. The CDN script and conflicting import maps were removed from `index.html`.

**Files affected:** `index.html`, `tailwind.config.js`, `src/index.css`, `vite.config.ts`

This amendment should be merged into ADR-008 in the main `DECISIONS.md` on the next document update.

---

## Merge Instructions

To apply this patch to the main `DECISIONS.md`:

1. Append ADR-010 through ADR-027 after ADR-009
2. Apply the ADR-008 amendment to the existing ADR-008 entry
3. Update the document header to reflect the new last-updated date
4. Verify the total ADR count is correct (9 existing + 18 new = 27)
