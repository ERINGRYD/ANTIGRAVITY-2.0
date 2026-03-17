# Architecture Decision Records (ADR)

This document serves as a permanent reference for architectural and product decisions made in the study application. It explains *why* the system works the way it does, providing context and reasoning for future development.

## 1. State Management: React Context API

**Context:** The application needs to manage global state for user progress (XP, level, stats), study subjects, questions, and UI preferences (dark mode, active views).
**Decision:** Use React Context (`AppContext`, `UIContext`) for global state management.
**Reasoning:** The application's state complexity is moderate. While libraries like Redux or Zustand offer robust solutions, React Context is built-in, requires no additional dependencies, and is sufficient for the current scale. It allows for clear separation of concerns (e.g., separating UI state from domain data).
**Rejected Alternatives:** 
- *Redux:* Too much boilerplate for the current application size.
- *Zustand/Jotai:* Considered, but native Context was chosen to minimize external dependencies during the initial build phase.
**Consequences:** 
- Simpler setup and fewer dependencies.
- Potential performance issues with unnecessary re-renders if context values change frequently, requiring careful memoization (`useMemo`, `useCallback`) in the future.

## 2. Data Persistence: Local Storage

**Context:** The application needs to save user progress, study sessions, and custom subjects/questions between sessions without a dedicated backend database.
**Decision:** Use browser `localStorage` for data persistence.
**Reasoning:** It provides a zero-setup, immediate solution for saving data locally on the user's device. This is ideal for a prototype or a privacy-first, offline-capable application.
**Rejected Alternatives:**
- *IndexedDB:* More powerful but has a more complex API.
- *Firebase/Supabase:* Requires network connectivity and backend setup, which was deferred for later phases.
**Consequences:**
- Data is tied to the specific browser and device.
- Storage capacity is limited (typically ~5MB).
- Data can be easily cleared by the user, risking data loss.

## 3. Gamification: RPG Mechanics (XP, HP, Stamina)

**Context:** Studying can be tedious. The application aims to increase user engagement and motivation.
**Decision:** Implement RPG-style gamification mechanics, including Experience Points (XP), Health Points (HP), Stamina, and "Battles" against topics.
**Reasoning:** Gamification leverages psychological reward systems. Framing study sessions as "battles" and topics as "enemies" transforms a passive activity into an active, engaging challenge. XP provides a sense of progression, while HP and Stamina introduce resource management and stakes.
**Rejected Alternatives:**
- *Standard Progress Bars:* Too generic and less engaging.
- *Points/Badges only:* Lacks the narrative depth of an RPG system.
**Consequences:**
- Requires careful balancing of XP gains and HP/Stamina depletion to avoid frustration or trivializing the system.
- The UI must clearly communicate these mechanics to the user.

## 4. Spaced Repetition: Ebbinghaus Forgetting Curve

**Context:** Users need an efficient way to review material and retain information long-term.
**Decision:** Implement a spaced repetition system based on the Ebbinghaus Forgetting Curve (`utils/ebbinghaus.ts`).
**Reasoning:** Spaced repetition is a scientifically proven method for improving memory retention. By calculating the "memory stability" and "force" of a topic based on the time since it was last reviewed and the user's performance, the system can intelligently schedule reviews when the user is most likely to forget the information.
**Rejected Alternatives:**
- *Leitner System (Flashcard Boxes):* Simpler but less precise than a time-based decay algorithm.
- *Manual Review Scheduling:* Relies on the user's intuition, which is often flawed.
**Consequences:**
- Requires tracking the exact timestamp of each review and the user's performance.
- The algorithm needs continuous tuning to ensure optimal review intervals.

## 5. Confidence-Based Scoring

**Context:** A simple "correct/incorrect" binary doesn't capture the nuance of a user's understanding. A lucky guess is not the same as confirmed mastery.
**Decision:** Implement a confidence-based scoring system (`utils/confidenceScoring.ts`) where users rate their confidence (Certain, Doubtful, Guess) alongside their answer.
**Reasoning:** This approach measures *metacognition* (awareness of one's own knowledge). It penalizes overconfidence (wrong + certain) more heavily than acknowledged ignorance (wrong + doubtful), and rewards true mastery (correct + certain) more than lucky guesses (correct + guess).
**Rejected Alternatives:**
- *Standard Accuracy (Correct/Total):* Fails to identify misconceptions or lucky guesses.
**Consequences:**
- Provides richer data for the spaced repetition algorithm.
- Requires the user to perform an extra step (selecting confidence) for each question, slightly increasing friction but vastly improving data quality.

## 6. Topic Progression: The "Room" System

**Context:** Topics need to be categorized based on the user's mastery level to guide their study focus.
**Decision:** Categorize topics into specific "Rooms" (Reconhecimento, Crítica, Alerta, Vencidos) based on their weighted score and spaced repetition status.
**Reasoning:** This provides a clear, visual representation of the user's learning journey. 
- *Reconhecimento:* New topics.
- *Crítica:* Topics with low scores (needs immediate attention).
- *Alerta:* Topics due for review based on the forgetting curve.
- *Vencidos:* Mastered topics.
**Rejected Alternatives:**
- *Continuous Progress Bars (0-100%):* Less actionable than discrete categories.
**Consequences:**
- The logic for moving topics between rooms must be robust and clearly tied to the confidence scoring and Ebbinghaus algorithms.

## 7. Audio Management: Centralized AudioService

**Context:** The application features ambient sounds (rain, lofi) for focus and alert sounds (bells) for timers.
**Decision:** Create a centralized `AudioService` singleton using the Web Audio API.
**Reasoning:** Managing audio directly in React components leads to memory leaks, overlapping audio contexts, and inconsistent volume control. A centralized service ensures a single `AudioContext`, handles loading/caching of audio buffers, and provides a clean API for components to play/stop sounds and adjust volume.
**Rejected Alternatives:**
- *HTML5 `<audio>` tags:* Less precise timing and harder to manage complex cross-fading or multiple simultaneous ambient tracks.
**Consequences:**
- Requires handling browser autoplay policies (audio context must be resumed after a user interaction).

## 8. UI Framework: Tailwind CSS & Motion

**Context:** The application requires a modern, responsive, and highly interactive user interface with complex animations.
**Decision:** Use Tailwind CSS for styling and `motion/react` (Framer Motion) for animations.
**Reasoning:** Tailwind allows for rapid UI development with utility classes, ensuring a consistent design system without writing custom CSS. Framer Motion provides a declarative API for complex animations (page transitions, drag-and-drop, micro-interactions) that are difficult to achieve with pure CSS.
**Rejected Alternatives:**
- *CSS-in-JS (Styled Components):* Heavier runtime performance cost.
- *Vanilla CSS/SCSS:* Slower development speed and harder to maintain consistency.
**Consequences:**
- HTML markup can become verbose with Tailwind classes.
- Framer Motion adds to the bundle size, but the visual polish justifies the cost.

## 9. Timer Architecture: Decoupled Logic

**Context:** The Pomodoro timer needs to run consistently, even if the user navigates between different views.
**Decision:** Manage the core timer state and logic globally (or high up in the component tree), while the `FocusModeView` acts primarily as a presentation layer.
**Reasoning:** If the timer state lived solely inside `FocusModeView`, navigating away would unmount the component and reset the timer. By decoupling the logic, the timer can continue ticking in the background.
**Consequences:**
- Requires careful synchronization between the global timer state and the UI.
- Background execution in browsers can be throttled, requiring timestamp-based delta calculations rather than relying solely on `setInterval`.
