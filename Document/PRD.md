# Product Requirements Document

> **Product:** Ciclo de Estudos (Tempos Labs)  
> **Version:** 1.0.0-draft  
> **Status:** Draft  
> **Last updated:** 2026-03-17

---

## 1. Product Overview

### Vision Statement
Transform the grueling process of high-stakes exam preparation into an engaging, data-driven RPG journey where students build mastery through structured cycles and strategic battles.

### Problem Statement
Studying for extensive exams (like "concursos públicos") is often unstructured, leading to burnout and inefficient review. Students struggle to balance their time across multiple subjects, fail to identify their true knowledge gaps (blind spots), and lose motivation due to a lack of visible, rewarding progress.

### Solution Summary
A gamified study management application that enforces a balanced "Study Cycle" to ensure all subjects are covered proportionally. It integrates an active-recall "Battle System" with confidence-based scoring to power a spaced repetition engine, ensuring users review topics exactly when they are about to forget them.

### Target User
**Primary user:** Dedicated students and "concurseiros" (civil service exam candidates).  
**User context:** Daily, intensive study sessions ranging from 2 to 8 hours, often spanning months or years of preparation.  
**User goal:** To achieve comprehensive mastery of a vast syllabus, maximize retention, and maintain motivation until exam day.

### Success Metrics
- **Daily Streak Maintenance:** Indicates sustained user engagement and habit formation.
- **Metacognition Index Improvement:** Measures the alignment between a user's confidence and their actual accuracy (reducing "wrong but certain" answers).
- **Cycle Completion Rate:** Tracks how effectively users are balancing their study time across all required subjects.

---

## 2. Core Concepts and Terminology

| Term | Definition | Example |
|------|-----------|---------|
| Ciclo (Cycle) | A balanced rotation of study time across all active subjects. | A cycle containing 60 min of Math and 120 min of Law. |
| Matéria (Subject) | A high-level domain of knowledge. | "Direito Constitucional" |
| Tema / Tópico (Topic) | A specific subdivision of a Subject. | "Direitos Fundamentais" |
| Inimigo (Enemy) | A topic or specific question faced in the Battle System. | A multiple-choice question about Article 5. |
| Batalha (Battle) | An active recall session where the user answers questions to test mastery. | A 20-question quiz on a specific topic. |
| Sala (Room) | A classification of a topic's mastery level, determining its review priority. | Reconhecimento, Crítica, Alerta, Vencidos. |
| Score Ponderado (Weighted Score) | A performance metric combining accuracy with self-reported confidence. | 85/100 (High accuracy, high certainty). |
| XP / HP / Stamina | Gamification metrics tracking progress, health (lives in battle), and energy. | Gaining 50 XP for a correct answer. |
| Arena Elite | A high-stakes battle mode with a time limit and a single life. | 45 seconds per question, 1 mistake ends the run. |

---

## 3. Feature Requirements

---

### FR-001 — Study Cycle Management

**Category:** Core Loop  
**Priority:** P0 (must have)  
**Status:** ✅ Implemented  

#### Description
Allows users to define their curriculum by creating subjects and topics, assigning target study times to each, and visually tracking their progress through the current rotation.

#### Requirements

**REQ-001.1** The user must be able to create, edit, and delete Subjects and Topics.
- Acceptance criteria: A new subject appears in the cycle list immediately after creation with its defined goal time and color.
- Edge case: Deleting a subject with existing study history must prompt a warning or handle orphaned data gracefully.

**REQ-001.2** The system must display the progress of the current cycle.
- Acceptance criteria: Progress bars fill proportionally as study time is logged, capping visually at 100% of the goal time.
- Edge case: If a user studies beyond the goal time, the excess time is recorded but the cycle progress bar does not exceed 100%.

#### Business Rules
- RULE: A cycle is considered "complete" only when all active subjects have reached their target goal time.
- RULE: Subjects can be reordered by the user, and the system must respect this order when suggesting the next subject.

#### Out of Scope
- Automatic generation of subjects based on an uploaded syllabus PDF.

---

### FR-002 — Focus Timer

**Category:** Core Loop  
**Priority:** P0 (must have)  
**Status:** ⚠️ Partial  

#### Description
A Pomodoro-style timer that tracks active study time, manages focus/break intervals, and logs the accumulated time to the active subject's cycle progress.

#### Requirements

**REQ-002.1** The user must be able to start, pause, and stop a focus timer for a specific subject.
- Acceptance criteria: Time elapsed during the "play" state is accurately added to the subject's `studiedMinutes` upon session completion.
- Edge case: If the user navigates away from the timer view, the timer must continue tracking time accurately.

**REQ-002.2** The system must support ambient background sounds and alert notifications.
- Acceptance criteria: User can toggle sounds (e.g., Rain, Lo-Fi) which play continuously during the focus block and stop during breaks.

#### Business Rules
- RULE: Study time is only permanently saved to the user's history when the session is explicitly concluded or a Pomodoro block finishes.
- RULE: The timer must distinguish between "Cycle Time" (counts toward the current rotation goal) and "Excess Time" (time studied beyond the goal).

#### Out of Scope
- Blocking external websites or apps during focus mode.

---

### FR-003 — Battle System (Active Recall)

**Category:** Battle  
**Priority:** P0 (must have)  
**Status:** ✅ Implemented  

#### Description
A gamified quiz interface where users answer questions related to their topics. It collects both the user's answer and their confidence level to calculate true mastery.

#### Requirements

**REQ-003.1** The system must present questions and require the user to select an answer AND a confidence level (Certain, Doubtful, Guess).
- Acceptance criteria: The "Confirm" button remains disabled until both an option and a confidence level are selected.
- Edge case: If the timer runs out in "Arena Elite" mode, the system automatically logs a "Wrong + Guess" attempt.

**REQ-003.2** The system must provide immediate feedback after an answer is confirmed.
- Acceptance criteria: The UI reveals the correct answer, the explanation (if available), and updates the user's HP/Lives if the answer was incorrect.

#### Business Rules
- RULE: In "Arena Elite" mode, the user has exactly 1 life and 45 seconds per question. A single mistake or timeout ends the session.
- RULE: In "Laboratório" mode, the system must prioritize presenting questions that contain detailed explanations.

#### Out of Scope
- Multiplayer or synchronous head-to-head battles.

---

### FR-004 — Spaced Repetition Engine

**Category:** Content / Analytics  
**Priority:** P0 (must have)  
**Status:** ✅ Implemented  

#### Description
Analyzes battle performance to classify topics into mastery "Rooms" and schedules them for future review based on the Ebbinghaus forgetting curve.

#### Requirements

**REQ-004.1** The system must classify a topic into a Room after a battle session.
- Acceptance criteria: A topic with a weighted score of 80 is moved to the "Vencidos" (Mastered) room and removed from the immediate active battle pool.
- Edge case: A topic with 0 historical questions answered defaults to the "Reconhecimento" room.

**REQ-004.2** The system must calculate when a "Vencidos" topic should return for review.
- Acceptance criteria: Based on the topic's memory stability, it is automatically moved to the "Alerta" room when its calculated retention drops below the threshold.

#### Business Rules
- RULE: Weighted score is calculated using the strict confidence matrix (e.g., Correct+Certain = 1.0, Wrong+Certain = -0.5).
- RULE: A topic is only archived (sent to Vencidos) if its weighted score is >= 75.

#### Out of Scope
- Manual override of the spaced repetition algorithm's scheduled return dates.

---

### FR-005 — Gamification System

**Category:** Gamification  
**Priority:** P1 (should have)  
**Status:** ⚠️ Partial  

#### Description
Rewards users for consistent study and good performance using RPG mechanics like Experience Points (XP), Levels, and Achievements.

#### Requirements

**REQ-005.1** The system must award XP for completing study sessions and answering questions correctly.
- Acceptance criteria: Completing a 25-minute Pomodoro awards a fixed amount of XP, which is immediately reflected in the user's total and progress bar.
- Edge case: XP multipliers apply based on the Battle Room (e.g., Arena Elite awards more XP per correct answer than Sala Principal).

**REQ-005.2** The system must track and display unlockable achievements.
- Acceptance criteria: When a user meets a specific condition (e.g., 7-day streak), an achievement is marked as unlocked and displayed in the profile.

#### Business Rules
- RULE: User level is strictly derived from total accumulated XP.
- RULE: Daily streaks increment only if a valid study session is recorded on consecutive calendar days.

#### Out of Scope
- In-game currency or a shop to spend XP on cosmetic items.

---

### FR-006 — Analytics and Insights

**Category:** Analytics  
**Priority:** P1 (should have)  
**Status:** ✅ Implemented  

#### Description
Provides visual dashboards for users to track their time investment, battle accuracy, and metacognitive performance.

#### Requirements

**REQ-006.1** The system must display time distribution across subjects.
- Acceptance criteria: A donut chart accurately reflects the percentage of total time spent on each subject over the selected period.

**REQ-006.2** The system must identify and highlight "Blind Spots".
- Acceptance criteria: The system lists topics where the user has the highest rate of "Wrong + Certain" answers, flagging them for urgent review.

#### Business Rules
- RULE: Statistics must be filterable by predefined time ranges (7 days, 30 days, 90 days, All time).

#### Out of Scope
- Predictive analytics for actual exam scores.

---

## 4. Business Rules Catalog

### Progress and Completion Rules

**BR-001 — Subject Cycle Completion**
- **Rule:** A subject's cycle rotation is complete when `studiedMinutes >= cycleGoalTime` for that rotation.
- **Source:** `SubjectCycleState` model logic.
- **Violation consequence:** The cycle does not advance correctly, and the user is prompted to study a subject they have already finished for the rotation.

### Scoring Rules

**BR-010 — Weighted Score Calculation**
- **Rule:** The weighted score is calculated as `(sum(attempt weights) / (total attempts × 1.0)) × 100`.
- **Weights:** 
  - Correct + Certain = 1.0
  - Correct + Doubtful = 0.6
  - Correct + Guess = 0.2
  - Wrong + Certain = -0.5 (Penalized for dangerous misconception)
  - Wrong + Doubtful = 0.0
  - Wrong + Guess = 0.1
- **Source:** `calculateWeightedScore()` in `utils/confidenceScoring.ts`.
- **Violation consequence:** Topics are placed in the wrong mastery rooms, breaking the spaced repetition logic.

### Classification Rules

**BR-020 — Enemy Room Classification**
- **Rule:** Topics are classified based on their weighted score:
  - 0 questions answered → Reconhecimento
  - Score < 50 → Crítica
  - Score < 75 → Alerta
  - Score >= 75 → Vencidos
- **Source:** `classifyEnemyRoom()` in `utils/confidenceScoring.ts`.
- **Violation consequence:** Users waste time reviewing mastered topics or ignore critical weak points.

**BR-021 — Memory Stability Estimation**
- **Rule:** Memory stability is a blended metric: `(accuracyRate * 0.4) + (weightedScore * 0.6)`.
  - Combined >= 80 → 20 days (Strong mastery)
  - Combined >= 65 → 12 days (Partial mastery)
  - Combined >= 45 → 7 days (Weak mastery)
  - Combined < 45 → 4 days (Minimal mastery)
- **Source:** `estimateMemoryStabilityWithConfidence()` in `utils/confidenceScoring.ts`.
- **Violation consequence:** Topics return from the archive too early or too late.

### Time Rules

**BR-030 — Excess Time Handling**
- **Rule:** Time studied beyond the `cycleGoalTime` is recorded as `excessTime`. It does not increase the cycle completion percentage beyond 100%, but it DOES count toward the topic's total accumulated mastery time.
- **Source:** `applyTimeIncrement()` in `types/subjectCycle.types.ts`.
- **Violation consequence:** The study cycle becomes unbalanced, or the user's total effort is underreported.

### Battle Rules

**BR-040 — Arena Elite Constraints**
- **Rule:** In "Arena Elite" (sala-2), the user starts with exactly 1 life and has a strict 45-second timer per question.
- **Source:** `BattleQuestionView.tsx` state initialization and timer effects.
- **Violation consequence:** The high-stakes gamification mode loses its challenge.

---

## 5. User Flows

### UF-001 — Start a Study Session (Auto-cycle ON)
1. User opens the app and navigates to the "Ciclo" tab.
2. User taps the Play (FAB) button.
3. System evaluates the cycle state using `resolveNextSubject()`.
   - [IF cycle is empty] → Flow ends, user is prompted to add subjects.
   - [IF all subjects complete] → Cycle complete modal is shown, flow ends.
4. System selects the first pending subject and opens `FocusModeView`.
5. Timer begins counting up.
6. [IF Pomodoro block ends] → System plays alert sound, switches to break mode.
7. [IF cycleGoalTime is reached]:
   - System checks if a Pomodoro is currently running.
   - [IF running] → Waits for Pomodoro to finish.
   - [IF done] → Initiates a 10-second transition countdown.
8. [IF user cancels countdown] → Stays on current subject, accumulating excess time.
9. [IF countdown completes] → Automatically advances to the next pending subject in the cycle.
10. Session ends when user explicitly taps "Finalizar" and saves the session.

### UF-002 — Complete a Battle Session
1. User navigates to the "Batalha" tab and taps "Iniciar Batalha".
2. User configures the HUD (Room, Mode, Question Limit, Subject Mix).
3. System filters available questions based on the configuration and topic Room status.
   - [IF no questions found] → Shows empty state, flow ends.
4. System presents the first question.
5. User selects an answer option.
6. User selects a confidence level (Certeza, Dúvida, Chute).
7. User taps "Confirmar".
8. System evaluates correctness and displays feedback.
   - [IF Arena Elite AND answer is wrong] → Lives drop to 0, session ends immediately (Go to step 10).
9. User taps "Próxima" to advance. Repeat steps 4-8 until limit is reached.
10. System calculates final XP, Accuracy, and Weighted Score.
11. System updates the Room classification for all involved topics.
    - [IF new room is 'Vencidos'] → Topic is archived to the Ebbinghaus engine.
12. System displays the Mission Report (Results View).
13. User taps "Finalizar" to save stats and return to the map.

---

## 6. Data Requirements

### Input Validation Rules

| Input | Minimum | Maximum | Type | Required | Error message / Behavior |
|-------|---------|---------|------|----------|--------------------------|
| Subject Name | 1 char | - | string | Yes | Button disabled |
| Goal Time | 1 min | - | number | Yes | Defaults/clamps to valid range |
| Topic Name | 1 char | - | string | Yes | Button disabled |
| Question Text | 1 char | - | string | Yes | Cannot save question |

### Computed Values

| Value | Formula / Logic | Derived from |
|-------|-----------------|--------------|
| Cycle Progress % | `(currentCycleTime / cycleGoalTime) * 100` (Capped at 100) | `SubjectCycleState` |
| Weighted Score | `(sum(weights) / total_attempts) * 100` | `QuestionAttempt[]` |
| Metacognition Index | Ratio of (Correct+Certain + Wrong+Doubtful) to Total | `QuestionAttempt[]` |
| Enemy Return Probability | `(1 - e^(-daysSinceVictory / memoryStability)) * 100` | `ArchivedEnemy` |

### Data Retention Rules

| Data | Retained for | Reset when | Never reset |
|------|--------------|------------|-------------|
| User XP & Level | Forever | - | ✓ |
| Subject Total Time | Forever | - | ✓ |
| Cycle Current Time | One rotation | User clicks "Reset Cycle" | |
| Question Attempts | Forever | - | ✓ |
| Archived Enemies | Forever | - | ✓ |

---

## 7. Non-Functional Requirements

### Performance
- The UI must remain responsive (60fps) during timer execution and battle transitions.
- Statistical calculations (e.g., Metacognition Index, Peak Hour) must be memoized or calculated asynchronously to prevent blocking the main thread when rendering the Analytics dashboard.

### Offline Capability
- The application must be 100% functional without an internet connection. All core logic, timers, and battle systems must execute locally.

### Data Persistence
- All user state (subjects, history, stats, settings) must be persisted to the browser's `localStorage` immediately upon modification to prevent data loss on accidental tab closure.

### Accessibility
- Color coding (e.g., Red for wrong, Green for correct) must be accompanied by text labels or distinct icons to support colorblind users.
- Touch targets on mobile devices must be adequately sized (minimum 44x44px equivalent) for comfortable interaction during fast-paced battles.

### Compatibility
- The application must function correctly on modern desktop browsers (Chrome, Firefox, Safari, Edge) and mobile browsers, utilizing responsive design principles (Tailwind breakpoints).

---

## 8. Constraints and Limitations

| Constraint | Reason | Impact |
|------------|--------|--------|
| Local Storage Only | Backend infrastructure deferred to future phases. | User data is bound to a single device/browser. Clearing browser data deletes all progress. |
| 1MB Storage Limit (Approx) | `localStorage` quota limits. | The app cannot store thousands of high-resolution images or massive question banks locally without risk of quota errors. |
| Audio Autoplay | Browser security policies. | Ambient sounds require a user interaction (click) before they can begin playing. |

---

## 9. Future Requirements (Planned)

**FR-FUTURE-001 — Cloud Synchronization**
- **Trigger:** Mentioned as a limitation of the current `localStorage` setup.
- **Description:** Implement a backend (e.g., Firebase) to sync user progress, subjects, and history across multiple devices.
- **Dependency:** Requires user authentication system.
- **Estimated impact:** High

**FR-FUTURE-002 — Dual-Counter Timer Integration**
- **Trigger:** Existence of `useStudyTimer.ts` and `SubjectCycleState` models that are not yet wired into `FocusModeView.tsx`.
- **Description:** Replace the legacy timer logic in the Focus view with the new hooks to accurately separate cycle time from excess accumulated time.
- **Dependency:** Refactoring data models to unify `Subject/Topic` with `Theme`.
- **Estimated impact:** High

**FR-FUTURE-003 — Full Data Export/Import**
- **Trigger:** `ImportJsonView` exists, but export is missing.
- **Description:** Allow users to download their entire `localStorage` state as a backup file and restore it.
- **Dependency:** None.
- **Estimated impact:** Medium

---

## 10. Acceptance Criteria Summary

### Study Cycle
- [ ] User can create a subject with a specific time goal.
- [ ] User can add topics to a subject.
- [ ] Cycle progress bar updates accurately when study time is logged.
- [ ] System detects when all subjects have reached their goal and prompts a cycle reset.

### Focus Timer
- [ ] Timer accurately counts elapsed time.
- [ ] Pomodoro intervals trigger breaks correctly.
- [ ] Ambient sounds play and pause in sync with the timer state.
- [ ] Session data (time, subject) is saved to history upon completion.

### Battle System
- [ ] User must select both an answer and a confidence level to proceed.
- [ ] Correct/Incorrect feedback is displayed immediately.
- [ ] Arena Elite mode enforces a 45-second limit and 1-life rule.
- [ ] Session results calculate XP, Accuracy, and Weighted Score accurately.

### Spaced Repetition
- [ ] Topics with a weighted score >= 75 are moved to the "Vencidos" room.
- [ ] Memory stability is calculated based on battle performance.
- [ ] Archived topics return to the "Alerta" room when their retention probability drops.

### Analytics & Gamification
- [ ] XP is awarded and accumulated correctly.
- [ ] Time distribution charts render accurately based on history.
- [ ] "Blind Spots" correctly identify topics with high "Wrong + Certain" rates.

---

## Document Maintenance Rules
Update this file when:
- A new feature requirement is defined
- A business rule changes
- An acceptance criterion is verified (check it off)
- A new constraint is discovered
- A planned feature moves to active development

Do NOT update this file for:
- Implementation details (use ARCHITECTURE.md)
- Architectural decisions (use DECISIONS.md)  
- Sprint tasks (use SPRINT_ATUAL.md)
- Bug fixes that don't change requirements

---

## Requirements Gaps

- **Behavior observed:** The `AchievementsView` displays a list of achievements, but there are no clear, documented business rules or triggers in the codebase that specify *exactly when* or *how* these achievements are unlocked during normal gameplay (e.g., what specific function call unlocks "Estudioso I"?). This appears to be an incomplete feature implementation.
- **Missing requirement:** There is no documented requirement for **Data Export**. Given the strict constraint of `localStorage`, a user has no way to back up their hundreds of hours of study data. This is a critical product gap that should be addressed immediately to prevent catastrophic data loss for users.
- **Behavior observed:** The `BattleSelectionHUD` allows users to select "Misturar todas as matérias" (Mix all subjects). However, it is unclear what the exact requirement is for question distribution when this is selected. Should it pull equally from all subjects, or randomly? This business rule is undocumented.
