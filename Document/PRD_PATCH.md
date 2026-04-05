# Product Requirements Document (PRD) Patch

This is a targeted patch for the existing `PRD.md` document. It adds missing feature requirements, corrects inaccurate business rules, and fills requirement gaps. Do not rewrite existing requirements that are correct; only apply the specific corrections and additions identified below.

---

## Existing PRD.md summary (do not duplicate)

The current document already covers:
- FR-001: Study Cycle Management (✅ mostly correct)
- FR-002: Focus Timer (⚠️ business rules incomplete)
- FR-003: Battle System — Active Recall (⚠️ one rule incorrect)
- FR-004: Spaced Repetition Engine (⚠️ threshold value wrong)
- FR-005: Gamification (XP, HP, Stamina) — assumed present
- FR-006: Analytics Dashboard — assumed present
- User flows UF-001 (Study Session) and UF-002 (Battle Session)
- Data requirements and acceptance criteria

---

## PART 1 — Corrections to existing requirements

### Correction 1 — REQ-004.1: wrong threshold value

Locate REQ-004.1 which states:
"A topic with a weighted score of 80 is moved to the Vencidos room"

Replace "80" with "75":
"A topic with a weighted score of 75 or higher is classified as Vencidos and archived."

**Reason:** The implemented threshold is >= 75, not >= 80. This is defined in `classifyEnemyRoom()` and is a P0 business rule. Using 80 in the PRD creates a contradiction with the code.

Also update the corresponding acceptance criterion in Section 10:
"Topics with a weighted score >= 75 are moved to the Vencidos room."

---

### Correction 2 — FR-003 REQ-003.1: clarify confidence collection order

Locate REQ-003.1 which states:
"The system must present questions and require the user to select an answer AND a confidence level"

Replace with:

**REQ-003.1** The system must collect the user's confidence level AFTER the answer is selected but BEFORE the correct answer is revealed. The correct answer reveal is gated — it only happens after both an answer AND a confidence level are selected. Skipping confidence selection is not permitted.
- **Acceptance criteria:** The answer reveal does not occur until the user has tapped one of the three confidence buttons (Tenho certeza / Tenho dúvida / Foi um chute).
- **Edge case:** If the timer expires in Arena Elite mode, the system automatically logs "Wrong + Guess" without requiring confidence input — this is the only exception to the gating rule.

**Reason:** The original requirement did not specify the ORDER of collection, which is critical. Collecting confidence after reveal makes the data retrospective and useless for metacognition measurement.

---

### Correction 3 — FR-002 Business Rules: add missing dual-counter rule

In FR-002 Focus Timer, the Business Rules section has:
"RULE: The timer must distinguish between Cycle Time and Excess Time"

This rule is incomplete. Replace it with:

- **RULE:** The timer runs TWO independent counters simultaneously:
  (1) Cycle Time — counts toward the rotation goal, capped at `cycleGoalTime`, resets each rotation.
  (2) Theme Accumulated Time — never capped, never resets, carries across all rotations until the theme is completed.
  
- **RULE:** When `cycleGoalTime` is reached, Cycle Time stops incrementing. Theme Accumulated Time continues incrementing as long as the user is studying, even after the cycle goal is met.

- **RULE:** Time studied beyond `cycleGoalTime` is recorded as `excessTime`. `excessTime` does NOT carry forward to the next rotation's goal calculation. It is stored for historical reference only.

---

## PART 2 — New Feature Requirements to add

Add these FR entries after the existing ones, numbered sequentially. Use the exact same format as existing FR entries in the document.

---

### FR-NEW-001 — Theme and Subtopic Management

**Category:** Content  
**Priority:** P0 (must have)  
**Status:** ⚠️ Partial — built, not integrated

#### Description
Allows users to define the content structure within a Subject by creating Themes (specific study topics) and optional Subtopics within each Theme. This content hierarchy is independent from the cycle time system but interacts with subject permanent completion.

#### Requirements

**REQ-NEW-001.1** The user must be able to create Themes inside a Subject.
- Each Theme requires: name (1-100 chars) and goal time (1-600 minutes)
- Subtopics are optional at creation time — zero or more may be added
- Maximum 20 subtopics per Theme
- **Acceptance criteria:** A new Theme appears in the Subject detail view immediately after creation with correct name and goal time.
- **Edge case:** Creating a Theme in a permanently completed Subject is not permitted — the "Adicionar Tema" button must be hidden.

**REQ-NEW-001.2** The user must be able to add Subtopics to an existing Theme.
- Form expands inline — no navigation away from current screen
- Subtopic name: required, 1-100 chars
- **Acceptance criteria:** New subtopic appears in Theme checklist immediately after confirmation.
- **Edge case:** Adding an incomplete subtopic to a Theme that was completed via checklist reverts the Theme to incomplete status.

**REQ-NEW-001.3** The system must support three subtopic completion sources with distinct behaviors:
- `manual-known`: User declares prior knowledge. Marks subtopic complete immediately. Does NOT award XP. User can revert this declaration.
- `manual-study`: User marks subtopic complete after studying. Awards XP normally. User can revert.
- `questions` (future): Set automatically by question resolution. Read-only — cannot be manually reverted.
- **Acceptance criteria:** `manual-known` subtopics are visually distinct from `manual-study` subtopics (different icon or color treatment).
- **Edge case:** Reverting a `manual-known` subtopic that was the last completed subtopic reopens the Theme (`isCompleted` → false).

#### Business Rules
- **RULE:** A Theme is completed when ANY of these is true:
  (1) `Theme.accumulatedTime >= Theme.goalTime`
  (2) ALL subtopics have `isCompleted === true` AND `subtopics.length > 0`
- **RULE:** A Subject is permanently completed ONLY when ALL of its Themes have `isCompleted === true` AND `themes.length > 0`. A Subject with no Themes is never permanently completed.
- **RULE:** Subject permanent completion is always derived — never stored. It is computed by `isSubjectCompleted(themes)` on demand.

#### Out of Scope
- Automatic subtopic generation from external content
- Importing theme structure from a syllabus file

---

### FR-NEW-002 — Cycle Mode: Auto vs Manual Subject and Theme Selection

**Category:** Core Loop  
**Priority:** P0 (must have)  
**Status:** ⚠️ Partial — hooks built, not connected

#### Description
The `isAutoCycle` toggle controls two levels of automation simultaneously: which subject the user studies, and which theme within that subject. This produces two distinct modes with fundamentally different contracts.

#### Requirements

**REQ-NEW-002.1** When `isAutoCycle` is ON (Guided Mode):
- The system automatically selects which subject to study next (first pending subject in cycle order)
- The system automatically selects which theme within that subject (first pending theme in theme order)
- The Play button starts the session immediately — no selection step
- **Acceptance criteria:** Tapping Play goes directly to the timer with the correct subject and theme pre-selected.

**REQ-NEW-002.2** When `isAutoCycle` is OFF (Manual Mode):
- The user selects which theme to study before the session starts
- A theme selection step appears between tapping Play and the timer starting — showing only pending (incomplete) themes for the currently active subject
- The user can cancel at this step without starting a session
- **Acceptance criteria:** Theme selection shows only incomplete themes. Selecting a theme and confirming starts the timer for that theme.

#### Business Rules
- **RULE:** The same `isAutoCycle` toggle governs both subject selection AND theme selection. There is no separate toggle for theme selection.
- **RULE:** In auto mode, if all themes of the selected subject are complete, the subject is permanently completed and the system selects the next subject automatically.

#### Out of Scope
- Allowing the user to override the auto-selected subject without disabling auto mode

---

### FR-NEW-003 — Session Transition on Cycle Goal Reached

**Category:** Core Loop  
**Priority:** P0 (must have)  
**Status:** ⚠️ Partial — hooks built, not connected

#### Description
When the user reaches the cycle goal time for a subject during a session, the system must handle the transition to the next subject differently depending on the current mode and whether the active theme is complete.

#### Requirements

**REQ-NEW-003.1** Auto mode transition when theme is incomplete:
- The system waits for the current Pomodoro session to complete before initiating transition — it does not interrupt active focus
- After Pomodoro completes: display warning overlay with theme name and a 10-second countdown
- Countdown label: "Avançando para [next subject] em Ns"
- User may cancel the countdown — if cancelled, session continues on current subject with time accumulating as `excessTime`
- If countdown completes: advance to next subject automatically
- The incomplete theme is resumed in the next rotation from its current accumulated time (not reset to zero)
- **Acceptance criteria:** `Theme.accumulatedTime` at transition equals the sum of all time spent on that theme across all sessions.

**REQ-NEW-003.2** Auto mode transition when theme is complete:
- Same sequence as REQ-NEW-003.1 but countdown shows success message
- Countdown label: "Tema concluído! Avançando em Ns"
- Cancel option still available

**REQ-NEW-003.3** Manual mode when cycle goal is reached:
- System immediately shows decision prompt (no countdown)
- Prompt: "O tema [X] está incompleto. Continuar neste tema ou mudar para [next subject]?"
- Prompt has NO auto-dismiss and NO close button — user must choose
- If user chooses continue: session continues, time accumulates as `excessTime` for cycle, normally for `Theme.accumulatedTime`
- If user chooses change: current session ends, theme retains all accumulated time for next rotation
- **Acceptance criteria:** Prompt remains visible indefinitely until user makes an explicit choice.

#### Business Rules
- **RULE:** The timer NEVER stops during a transition sequence — time continues accumulating as `excessTime` during the countdown or decision prompt.
- **RULE:** The Pomodoro completion gates the auto-mode countdown — the system must not interrupt an active Pomodoro session.
- **RULE:** A cancelled countdown does not prevent future countdowns in the same session — if the user cancels and continues studying past the goal, time continues as `excessTime`.

#### Out of Scope
- Allowing the user to pause the countdown

---

### FR-NEW-004 — Defeated Enemy: Archiving and Return Schedule

**Category:** Battle / Spaced Repetition  
**Priority:** P0 (must have)  
**Status:** ⚠️ Partial — logic built, archiving trigger had critical bug

#### Description
When an enemy is defeated (topic reaches `weightedScore >= 75`), it is archived to the Vencidos page with a personalized forgetting curve that schedules its automatic return to the Battle Field.

#### Requirements

**REQ-NEW-004.1** Enemy archiving must trigger immediately when `weightedScore >= 75` at session end.
- **Acceptance criteria:** Enemy disappears from all Battle Field rooms (Reconhecimento, Crítica, Alerta) and appears in VencidosPage within the same session-end flow.
- **Edge case:** If the enemy was previously archived (returning enemy), its `returnCount` increments and its memory stability is refined using: `newS = (newBattleS × 0.6) + (currentS × 0.4)`

**REQ-NEW-004.2** Memory stability must be estimated from battle accuracy.
- On first archiving: `S = estimateMemoryStability(accuracyRate)` where:
  `accuracyRate >= 85%` → S = 20 | `>= 70%` → S = 12 | `>= 50%` → S = 7 | `< 50%` → S = 4
- **Acceptance criteria:** Two users defeating the same topic with different accuracies receive different return schedules.

**REQ-NEW-004.3** The forgetting bar must be continuous (0-100%) and always computed from the formula: `(1 - e^(-daysSince / S)) × 100`
- **Acceptance criteria:** The bar value increases every day without the user needing to open the app to trigger recalculation.
- **Edge case:** Bar value is always recalculated at render time — it is never stored as a static value.

**REQ-NEW-004.4** Return intervals follow a progressive schedule:
- 1st return: 1 day after last victory
- 2nd return: 7 days
- 3rd return: 15 days
- 4th return: 30 days
- 5th return onward: 30 days repeating until `contestDate`
- If `contestDate` is set and next return date would exceed it: cap `nextReturnDate` at `contestDate`
- **Acceptance criteria:** An enemy defeated today for the first time returns to the Battle Field tomorrow.

**REQ-NEW-004.5** Returning enemies always enter the Alerta room.
- Never Reconhecimento (user has prior mastery)
- Never Crítica (too punitive for previously mastered content)
- Post-return battle outcomes:
  - `score >= 75` → re-archived (`returnCount++`)
  - `score 50-74` → stays in Alerta
  - `score < 50`  → moves to Crítica
- If user loses the return battle: enemy stays in Battle Field, difficulty and question count do NOT reset

#### Business Rules
- **RULE:** The forgetting bar never triggers without actual time passing — it cannot be manipulated by changing device date.
- **RULE:** Daily question count grows as forgetting increases:
  `baseQuestions = 5 + ((1 - retention) × (totalAvailable - 5))`
  capped at `totalQuestionsAvailable`
- **RULE:** Enemy archiving is a three-step atomic operation:
  (1) Create/update `archived_enemies` record
  (2) Remove enemy from Battle Field rooms
  (3) Update UI state
  If any step fails, the operation must be retried — partial archiving (enemy appears in both places) is a critical bug.

#### Out of Scope
- User-configurable return intervals

---

### FR-NEW-005 — Statistics Page (7 Dimensions)

**Category:** Analytics  
**Priority:** P1 (should have)  
**Status:** ⚠️ Partial — page built, not integrated into navigation

#### Description
A dedicated analytics page giving users actionable insights across 7 statistical dimensions, with automatic diagnostic insights and direct CTAs to initiate battle sessions from within the stats view.

#### Requirements

**REQ-NEW-005.1** The page must default to the last 7 days of data.
- Period selector allows: 7 dias | 30 dias | 90 dias | Tudo
- Changing period re-filters ALL 7 dimensions simultaneously
- Default is always 7 days on every mount — never persisted
- **Acceptance criteria:** Opening stats always shows last 7 days data, regardless of what period was selected in the previous session.

**REQ-NEW-005.2** Four automatic insights must always be visible at top.
These are always computed and never dismissable:
- Metacognition Index: `(correct+certain + wrong+guess) / total × 100`
- Largest Blind Spot: topic with highest (`wrong+certain`) rate
- Ideal Battle Duration: session length where distraction errors peak
- Peak Study Hour: hour of day with lowest distraction error rate
- **Acceptance criteria:** All 4 insights render even when data is insufficient — show "Dados insuficientes" state in that case.

**REQ-NEW-005.3** Seven navigation tabs must be present:
Geral | Por Matéria | Por Tema | Confiança | Erros | Tempo Total | Tempo/Questão
- Each tab shows independent content filtered by current period
- **Acceptance criteria:** Switching tabs does not reset the period filter.

**REQ-NEW-005.4** The Por Tema and Erros tabs must include "Iniciar Batalha" buttons that trigger battle sessions.
- Button calls `onStartBattle(topicId)` callback
- **Acceptance criteria:** Tapping "Iniciar Batalha" from the stats page navigates to the battle configuration for that topic.

**REQ-NEW-005.5** The export button must be present but non-functional.
- Shows toast: "Exportação disponível em breve"
- Does not implement actual export logic
- **Acceptance criteria:** Button is visible, tap shows toast, no navigation or file download occurs.

#### Business Rules
- **RULE:** All statistical calculations run on filtered data only — never on the raw unfiltered attempts array.
- **RULE:** Weighted score is always preferred over pure accuracy for subject and topic rankings — pure accuracy is shown as a secondary metric only.
- **RULE:** Charts never use hardcoded colors — subject accent colors always come from `subjectColor` field on `BattleAttempt`.

#### Out of Scope
- Actual data export/download (deferred — button is stub only)
- Sharing statistics externally

---

### FR-NEW-006 — Cycle View Visual Hierarchy

**Category:** UX  
**Priority:** P1 (should have)  
**Status:** ⚠️ Partial — components built, not integrated

#### Description
The subject card grid must communicate cycle state through clear visual hierarchy so users can identify their position in the cycle at a glance, without reading any text.

#### Requirements

**REQ-NEW-006.1** The active subject card must be visually distinct from all other cards before any text is read.
- Active card must have: larger size OR accent border OR prominent badge — at minimum two of these three
- Badge text: "Em andamento" or "Agora"
- **Acceptance criteria:** In a 5-card cycle, a user with no prior knowledge of the app can identify the active card within 3 seconds.

**REQ-NEW-006.2** Pending cards must visually recede relative to active.
- Reduced opacity (0.75 or less) OR muted color OR smaller size
- **Acceptance criteria:** Active card has visibly higher visual weight than all pending cards simultaneously visible on screen.

**REQ-NEW-006.3** The active card must always appear first (position 0).
- **Acceptance criteria:** Regardless of original creation order, the currently active subject appears in the top-left or top position of the grid.

**REQ-NEW-006.4** Each subject card must have a left accent border using the subject's assigned color.
- Border width: 5px
- Full card height
- **Acceptance criteria:** Every card in the cycle (active, pending, completed) shows the subject's color as a left border.

#### Business Rules
- **RULE:** There can only ever be ONE active card at a time.
- **RULE:** Cards with `isRotationCompleted === true` show a "Meta atingida" state — visually distinct from both active and pending states.
- **RULE:** Permanently completed subjects are shown in a separate collapsed section labeled "Matérias concluídas", never in the main cycle grid.

#### Out of Scope
- Animated transitions between card states (nice to have)

---

## PART 3 — Corrections to existing sections

### Correction to Terminology table

Add these missing terms to the Core Concepts table in Section 2:

| Term | Definition | Example |
|------|-----------|---------|
| Tema (Theme) | A specific content unit within a Subject that has its own study time goal and optional subtopic checklist. | "Funções do 2º Grau" inside "Matemática" |
| Subtópico | A granular content item within a Theme, completable via checklist or question resolution. | "Propriedades das funções" |
| rodada (Rotation) | One complete pass through the cycle — all subjects reaching their cycle goal time once. | Completing 60min in each of 5 subjects = 1 rotation |
| Ciclo automático | The mode where the system selects both subject and theme automatically. Controlled by isAutoCycle toggle. | System advances to next subject after goal is reached |
| Modo manual | The mode where the user selects themes and decides when to advance subjects. | User picks "Funções" before starting timer |
| Tempo de ciclo | Time counted toward the current rotation goal. Resets each rotation. Capped at cycleGoalTime. | 45 of 60 minutes complete this rotation |
| Tempo acumulado | Total time studied on a Theme across ALL rotations. Never resets. Used for Theme completion. | 3h 20min studied on "Funções" across 4 rotations |
| Força de retorno | The forgetting bar percentage (0-100%) indicating how much of an archived enemy's knowledge has decayed. | 85% = enemy about to return |
| Score ponderado | Confidence-weighted performance score (0-100) using the 6-combination weight matrix. Always preferred over pure accuracy. | 72/100 weighted vs 85% pure accuracy |
| Estabilidade de memória (S) | The Ebbinghaus stability value for a user-topic pair. Higher S = slower forgetting. Estimated from battle accuracy. | S=20 for a topic mastered with 90% accuracy |

---

### Correction to Input Validation table

Replace the existing Input Validation table with:

| Input | Minimum | Maximum | Type | Required | Error message |
|-------|---------|---------|------|----------|---------------|
| Subject name | 1 char | 100 chars | string | Yes | "O nome não pode estar vazio" |
| Subject goal time | 1 min | 600 min | integer | Yes | "Meta entre 1 e 600 minutos" |
| Topic name | 1 char | 100 chars | string | Yes | "O nome não pode estar vazio" |
| Theme name | 1 char | 100 chars | string | Yes | "O nome do tema não pode estar vazio" |
| Theme goal time | 1 min | 600 min | integer | Yes | "Defina uma meta entre 1 e 600 minutos" |
| Subtopic name | 1 char | 100 chars | string | Yes | "O nome do subtópico não pode estar vazio" |
| Subtopics per theme | 0 | 20 | count | No | Trigger button hidden when limit reached |
| Question text | 1 char | — | string | Yes | Cannot save question |
| Battle question count | 1 | totalAvailable | integer | Yes | Clamped to valid range |

---

### Correction to Computed Values table

Add these missing computed values:

| Value | Formula | Derived from |
|-------|---------|-------------|
| isThemeCompleted | `accumulatedTime >= goalTime` OR (`all subtopics.isCompleted` AND `subtopics.length > 0`) | Theme model |
| isSubjectCompleted | ALL `themes.isCompleted === true` AND `themes.length > 0` | Theme[] per Subject |
| barValue (forgetting) | `(1 - e^(-daysSinceVictory / S)) × 100`, capped at 100 | ArchivedEnemy.lastVictoryDate + S |
| currentQuestions | `5 + ((1 - retention) × (totalAvailable - 5))`, capped at totalAvailable | ArchivedEnemy + current date |
| metacognitionIndex | `(correct+certain + wrong+guess) / total × 100` | QuestionAttempt[] |
| luckIndex | `pureAccuracy - weightedScore` | QuestionAttempt[] |

---

### Correction to Data Retention table

Add these missing rows:

| Data | Retained for | Reset when | Never reset |
|------|-------------|------------|-------------|
| Theme.accumulatedTime | Forever | Never | ✓ |
| SubjectCycleState.currentCycleTime | One rotation | New rotation starts | |
| SubjectCycleState.excessTime | One rotation | New rotation starts | |
| ArchivedEnemy.memoryStability | Forever | Never | ✓ |
| ArchivedEnemy.returnCount | Forever | Never | ✓ |
| Subtopic.completionSource | Forever | When user reverts manual completion | |

---

### Correction to Acceptance Criteria — add missing sections

Add these sections to Section 10:

### Theme and Subtopic Management
- [ ] User can create a Theme with name and goal time inside a Subject
- [ ] User can add subtopics to a Theme inline without page navigation
- [ ] Subtopic marked as `manual-known` is visually distinct from `manual-study`
- [ ] Marking subtopic as `manual-known` does NOT award XP
- [ ] Adding an incomplete subtopic to a completed Theme reverts Theme to incomplete
- [ ] "Adicionar Tema" button is hidden when Subject is permanently completed

### Cycle Mode (Auto vs Manual)
- [ ] In auto mode, Play immediately starts session with system-selected subject and theme
- [ ] In manual mode, Play shows theme selection step before starting timer
- [ ] Theme selection shows only incomplete themes
- [ ] Both cycle time and theme accumulated time update during session

### Session Transitions
- [ ] In auto mode, countdown appears AFTER Pomodoro completes (not mid-Pomodoro)
- [ ] Countdown shows theme completion status (complete vs incomplete)
- [ ] User can cancel countdown in auto mode to stay on current subject
- [ ] In manual mode, decision prompt has no auto-dismiss and no close button
- [ ] Timer never pauses during countdown or decision prompt

### Enemy Archiving
- [ ] Enemy disappears from Battle Field immediately when `weightedScore >= 75`
- [ ] Enemy appears in VencidosPage after archiving
- [ ] Forgetting bar increases daily without requiring app to be open
- [ ] Enemy returns to Alerta room (never Crítica or Reconhecimento)
- [ ] `returnCount` increments on each re-archiving
- [ ] Enemy with `contestDate` set never schedules return after `contestDate`

### Statistics Page
- [ ] Page defaults to last 7 days on every open
- [ ] Period filter applies to all 7 tabs simultaneously
- [ ] 4 insight cards always visible (even with insufficient data)
- [ ] "Iniciar Batalha" button works from Por Tema tab
- [ ] Export button shows toast without navigating or downloading

---

## PART 4 — Additions to Future Requirements

Add these to Section 9:

**FR-FUTURE-004 — Question-based subtopic completion**
- **Trigger:** `completionSource === 'questions'` in Subtopic model, defined but not implemented
- **Description:** Subtopics automatically marked complete when user answers related questions with high confidence and accuracy. This completion is read-only — cannot be manually reverted.
- **Dependency:** Question bank must have topic-subtopic mapping.
- **Estimated impact:** High

**FR-FUTURE-005 — Diagnostic test for prior knowledge assessment**
- **Trigger:** `manual-known` completion source implies user self-reports knowledge without verification
- **Description:** A structured diagnostic test that evaluates which subtopics/topics the user already knows before beginning study, replacing self-report with evidence-based prior knowledge assessment.
- **Dependency:** Question bank with subtopic mapping + FR-FUTURE-004.
- **Estimated impact:** High

**FR-FUTURE-006 — Contest date configuration**
- **Trigger:** `contestDate` field in ArchivedEnemy model, referenced in interval calculation but not exposed in UI
- **Description:** Allow user to set a target exam date in Settings. All spaced repetition return dates are capped to never exceed this date, ensuring all mastered content is reviewed before the exam.
- **Dependency:** Settings screen.
- **Estimated impact:** Medium

---

## Merge Instructions

To apply this patch to the main `PRD.md`:

1. Apply Correction 1 to REQ-004.1 (threshold 80 → 75)
2. Apply Correction 2 to REQ-003.1 (confidence order)
3. Apply Correction 3 to FR-002 Business Rules (dual-counter rules)
4. Append FR-NEW-001 through FR-NEW-006 after existing FR entries
5. Add missing terms to Section 2 terminology table
6. Replace input validation table with corrected version
7. Add missing rows to computed values table
8. Add missing rows to data retention table
9. Add new acceptance criteria sections to Section 10
10. Add FR-FUTURE-004, 005, 006 to Section 9
11. Update last-updated date

After merging, verify:
- No feature in codebase is missing a corresponding FR entry
- Every business rule with a numeric value matches the code exactly
- No FR is marked ✅ Implemented unless reachable from the UI
- All acceptance criteria are specific and testable
