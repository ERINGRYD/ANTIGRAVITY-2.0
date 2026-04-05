# Product Requirements Document (PRD) - Corrigido

## 1. Product Overview
**Name:** Antigravity Study App (Name inferred from context)
**Purpose:** A gamified study application designed to optimize learning through spaced repetition, Pomodoro cycles, and RPG-like progression mechanics.
**Target Audience:** Students preparing for exams, certifications, or anyone seeking a structured and engaging way to learn and retain information.

## 2. Core Concepts
*   **Subjects & Topics:** The hierarchical structure of study material. Subjects contain Topics, which contain Subtopics.
*   **Study Cycle (Ciclo de Estudos):** A structured rotation of subjects based on assigned weights/goal times.
*   **Pomodoro Timer:** A dual-mode timer (Focus/Battle) with configurable intervals and breaks.
*   **Battle System (Coliseu):** A gamified testing environment where users answer questions to earn XP, with performance affecting their "HP" and "Stamina".
*   **Spaced Repetition (Ebbinghaus):** An algorithm that schedules questions for review based on memory stability and confidence levels.
*   **Gamification:** Users earn XP, level up, maintain streaks, and unlock achievements based on their study activity.

## 3. Feature Requirements

### 3.1 Content Management (Subjects, Topics, Questions)
*   **Subject Creation:** Users can create subjects with a name, short name (sigla), color (from a predefined palette of 8 colors), and weekly hour goal.
    *   *Status:* ✅ Implemented (`/components/AddSubjectView.tsx`, line ~23)
*   **Topic/Subtopic Management:** Subjects contain topics, which can optionally contain subtopics.
    *   *Status:* ✅ Implemented (`/types/theme.types.ts`, line ~3)
*   **Question Bank:** Users can add questions to specific subjects/topics/subtopics.
    *   *Status:* ✅ Implemented (`/components/AddQuestionView.tsx`, line ~14)
*   **Question Types:** Supports Multiple Choice (`multipla`), True/False (`certo_errado`), and Flashcards (`flashcard`).
    *   *Status:* ✅ Implemented (`/components/AddQuestionView.tsx`, line ~28)
*   **JSON Import:** Users can import an array of questions in JSON format, linking them to a selected subject and topic.
    *   *Status:* ✅ Implemented (`/components/ImportJsonView.tsx`, line ~10)
*   **Subject Reordering:** Users can drag and drop subjects to reorder them in the cycle.
    *   *Status:* ✅ Implemented (`/components/BattleView.tsx`, line ~150)

### 3.2 Study Cycle & Timer
*   **Dual-Counter System:** Tracks both `currentCycleTime` (resets per rotation, capped at goal) and `accumulatedTime` (permanent total).
    *   *Status:* ✅ Implemented (`/types/subjectCycle.types.ts`, line ~1)
*   **Pomodoro Timer:** Configurable focus, short break, and long break intervals.
    *   *Status:* ✅ Implemented (`/components/FocusModeView.tsx`)
*   **Sound Settings:** Users can configure general volume, ambient sounds (Chuva, Cafeteria, Lo-fi, Ondas), and alert sounds for different timer events.
    *   *Status:* ✅ Implemented (`/components/PomodoroSoundsView.tsx`, line ~12)

### 3.3 Battle System (Coliseu)
*   **Battle Modes:** Supports different modes like 'reconhecimento', 'critica', 'alerta', 'revisao', 'arena-elite', and 'laboratório'.
    *   *Status:* ✅ Implemented (`/components/BattleSelectionHUD.tsx`, line ~20)
*   **Room Classification:** Enemies (questions) are categorized into rooms based on performance:
    *   **Reconhecimento:** New questions (0 attempts).
    *   **Crítica:** `weightedScore < 50`
    *   **Alerta:** `weightedScore >= 50` and `< 75`
    *   **Vencidos:** `weightedScore >= 75`
    *   *Status:* ✅ Implemented (`/utils/confidenceScoring.ts`, line ~60)
*   **Weighted Scoring:** Score is calculated based on correctness and confidence (Certeza, Dúvida, Chute).
    *   *Status:* ✅ Implemented (`/utils/confidenceScoring.ts`, line ~30)
*   **Spaced Repetition (Ebbinghaus):** Calculates memory stability and next review dates for archived enemies.
    *   *Status:* ✅ Implemented (`/utils/ebbinghaus.ts`, line ~1)

### 3.4 Gamification & RPG Elements
*   **HP & Stamina:** Tracked during battles. Exact depletion/regeneration formulas need formalization.
    *   *Status:* ⚠️ Partial (`/components/CombatView.tsx`, `/components/BattleQuestionView.tsx`)
*   **XP & Leveling:** Users earn XP for studying and answering questions, progressing through levels.
    *   *Status:* ✅ Implemented (`/hooks/usePersistedState.ts`, `/components/AchievementsView.tsx`)
*   **Daily Streak:** Tracks consecutive days studied.
    *   *Status:* ✅ Implemented (`/hooks/usePersistedState.ts`)
*   **Achievements:** A static list of achievements exists in the UI, but the unlocking logic is not fully integrated.
    *   *Status:* ⚠️ Partial (`/components/AchievementsView.tsx`, line ~10)

### 3.5 Analytics & History
*   **Study History:** Sessions are logged with details like subject, time spent, XP earned, and battle stats.
    *   *Status:* ✅ Implemented (`/components/HistoryView.tsx`, line ~14)
*   **Statistics Calculation:** Utilities exist to calculate accuracy, luck index, metacognition index, etc.
    *   *Status:* ✅ Implemented (`/utils/statsCalculations.ts`, line ~1)

### 3.6 Settings & Notifications
*   **System Preferences:** Options to unify tabs and clear the question bank.
    *   *Status:* ✅ Implemented (`/components/SettingsView.tsx`, line ~8)
*   **Notification Preferences:** UI toggles for various alerts, but no underlying delivery mechanism.
    *   *Status:* ⚠️ Partial (`/components/NotificationsView.tsx`, line ~11)

## 4. Business Rules Catalog

*   **BR-001 (Room Classification):**
    *   If `attempts === 0`, room is `reconhecimento`.
    *   If `weightedScore < 50`, room is `critica`.
    *   If `weightedScore >= 50` AND `< 75`, room is `alerta`.
    *   If `weightedScore >= 75`, room is `vencidos`.
*   **BR-002 (Weighted Score):**
    *   Correct + Certeza = 100
    *   Correct + Dúvida = 75
    *   Correct + Chute = 50
    *   Incorrect + Chute = 25
    *   Incorrect + Dúvida = 0
    *   Incorrect + Certeza = -25
*   **BR-003 (Cycle Time Increment):**
    *   `currentCycleTime` is capped at `cycleGoalTime`. Any excess is added to `excessTime`.
    *   `accumulatedTime` (on the Theme) increments indefinitely.

## 5. User Flows
*   **Study Flow:** Home -> Select Subject -> Start Pomodoro -> Complete Session -> View Summary.
*   **Battle Flow:** Home -> Coliseu -> Select Parameters (Mode, Room, Limit) -> Answer Questions -> View Results.
*   **Content Creation:** Home -> Add Subject/Question -> Fill Details -> Save.

## 6. Data Requirements
*   **Storage:** All data is currently persisted in `localStorage`.
*   **Key Entities:** `Subject`, `Topic`, `Question`, `BattleAttempt`, `StudySession`, `UserStats`, `PomodoroSettings`.

## 7. Non-Functional Requirements
*   **Performance:** The app should load quickly and handle hundreds of questions in `localStorage` without significant lag.
*   **Usability:** The interface must be mobile-responsive and support dark mode.
*   **Reliability:** Data must be reliably saved to `localStorage` after every significant action.

## 8. Constraints
*   **Local Storage Limits:** The app is constrained by the ~5MB limit of `localStorage`.
*   **No Backend:** Features requiring server-side logic (e.g., real push notifications, cross-device sync) are currently impossible.

## 9. Future Requirements
*   Cloud synchronization (Firebase/Supabase).
*   Social features (leaderboards, sharing).
*   Advanced analytics dashboards.

## 10. Acceptance Criteria
*   All features marked as ✅ Implemented must function without critical errors.
*   Data must persist across browser reloads.
*   The UI must reflect the current state accurately (e.g., progress bars, HP/Stamina).

## 11. Document Maintenance Rules
*   This document must be updated whenever a new feature is implemented or a business rule changes.
*   Status updates must be verified against the actual codebase.

## 12. Requirements Gaps & Technical Debt

Based on the codebase analysis, the following areas require further definition, implementation, or refactoring:

1.  **Gamification Logic (Partial Implementation):**
    *   **Achievements:** The `AchievementsView.tsx` displays a static list of achievements. The logic to actually unlock them based on user actions (e.g., studying for 7 days, completing 50 battles) is missing or incomplete in the core state management (`usePersistedState.ts`, `AppContext.tsx`).
    *   **RPG Mechanics:** While HP, Stamina, and XP are tracked and displayed, the exact mathematical formulas for their depletion (e.g., how much HP is lost per wrong answer in specific rooms) and regeneration (e.g., how much Stamina is recovered after a break) need to be formalized and consistently applied across all relevant components.

2.  **Notification System (UI Only):**
    *   The `NotificationsView.tsx` allows users to toggle preferences for various alerts (Daily Reminder, Weekly Report, Battle Alert, etc.). However, there is no underlying service or logic implemented to actually trigger and deliver these notifications (e.g., using the Web Notifications API or a service worker).

3.  **Data Persistence Robustness:**
    *   The application currently relies entirely on `localStorage` for data persistence. This is suitable for a prototype or MVP but poses risks for long-term data security, cross-device synchronization, and storage limits. A migration plan to a robust backend database (e.g., Firebase Firestore, Supabase) is necessary for a production-ready application.

4.  **Archived Enemy `contestDate`:**
    *   The `ArchivedEnemy` interface includes a `contestDate` field, which is populated when an enemy is archived. However, there is no clear UI or workflow for users to view, manage, or act upon this "contest" date (e.g., a dedicated view for reviewing contested questions).

5.  **Theme vs. SubjectCycleState Integration:**
    *   The dual-counter system for study cycles is implemented, but the synchronization between `SubjectCycleState` (which manages the active rotation) and `Theme` (which tracks overall completion) needs careful review to ensure edge cases (e.g., manually marking a theme as complete while it's active in a cycle) are handled correctly without data inconsistencies.
