# FocusModeView

**File:** `src/components/FocusModeView.tsx`  
**Category:** Page  
**Complexity:** High  
**Status:** Active  
**Last updated:** March 2026

---

## Purpose

This component is the core study timer and session management screen. It provides the interface for users to execute Pomodoro cycles, track their study time, manage breaks, and log their sessions. Without this component, the app would lack its primary active-study tracking mechanism, forcing users to track time externally.

---

## Props
```typescript
interface FocusModeViewProps {
  // Array of all subjects available for study. Used to populate the queue and selector.
  subjects: Subject[];
  
  // Optional ID of the subject to start focusing on immediately.
  initialSubjectId?: string;
  
  // Whether the app should automatically transition to the next subject when a cycle goal is met.
  isAutoCycle?: boolean;
  
  // Current user settings for Pomodoro timers (focus time, break times, sounds, etc.).
  pomodoroSettings: PomodoroSettings;
  
  // Callback to update Pomodoro settings from within the view's settings overlay.
  setPomodoroSettings: (settings: PomodoroSettings) => void;
  
  // Called when the user exits the focus mode to return to the main app navigation.
  onBack: () => void;
  
  // Called to award experience points when a Pomodoro or session is completed.
  onAddXP: (amount: number) => void;
  
  // Called to save the completed study session data to the global history.
  onRecordSession: (session: {
    subjectId: string;
    subjectName: string;
    topicName: string;
    minutesStudied: number;
    questionsCompleted: number;
    accuracy: number;
    xpEarned: number;
    type: 'foco' | 'batalha' | 'revisao';
    pagesRead?: number;
    pauseMinutes?: number;
    stopPoint?: string;
  }) => void;
  
  // History of past sessions, used to determine the last stop point for the current subject.
  studyHistory?: StudySession[];
}
```

### Props Table

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| subjects | Subject[] | Yes | — | List of all subjects |
| initialSubjectId | string | No | undefined | Subject to start with |
| isAutoCycle | boolean | No | undefined | Auto-transition flag |
| pomodoroSettings | PomodoroSettings | Yes | — | Timer configuration |
| setPomodoroSettings | function | Yes | — | Updates timer config |
| onBack | () => void | Yes | — | Exits focus mode |
| onAddXP | (amount: number) => void | Yes | — | Awards XP |
| onRecordSession | function | Yes | — | Saves session data |
| studyHistory | StudySession[] | No | [] | Past sessions |

---

## Visual States

### State: Focus Mode (Active)
**Condition:** `timerMode === 'focus'` and `isActive === true`  
**Screenshot description:** A large circular timer counting down. The background is a subtle blue tint. The central icon is a brain (`psychology`). The status badge reads "FOCO ATIVO".
- Background: `bg-slate-50` (light) / `bg-slate-950` (dark)
- Border: `border-blue-100`
- Badge: "FOCO ATIVO" (blue)
- Icon: `psychology` (blue)
- Interactions available: Pause timer, toggle Strict Mode, open queue, open settings.

### State: Strict Mode (Active)
**Condition:** `timerMode === 'focus'` and `strictMode === true`  
**Screenshot description:** Similar to Focus Mode, but with red/orange accents warning the user. The background has a red tint. The icon is a lock. The status badge reads "ESTRITO ATIVO".
- Background: `bg-[#FDF2F2]`
- Border: `border-red-100`
- Badge: "ESTRITO ATIVO" (red)
- Icon: `lock` (red)
- Interactions available: The "Back" button is disabled. User must complete the timer or manually disable strict mode.

### State: Short Break
**Condition:** `timerMode === 'shortBreak'`  
**Screenshot description:** The timer displays the short break duration. Cyan accents. The icon is a coffee cup.
- Background: `bg-cyan-50/30`
- Border: `border-cyan-100`
- Badge: "DESCANSO CURTO" (cyan)
- Icon: `coffee` (cyan)

### State: Long Break
**Condition:** `timerMode === 'longBreak'`  
**Screenshot description:** The timer displays the long break duration. Purple accents. The icon is a spa lotus.
- Background: `bg-purple-50/30`
- Border: `border-purple-100`
- Badge: "DESCANSO LONGO" (purple)
- Icon: `spa` (purple)

### State: Manual Pause
**Condition:** `timerMode === 'manualPause'`  
**Screenshot description:** The timer circle rotates backwards. Amber accents. The timer counts *up* to track how long the user has been paused.
- Background: `bg-amber-50/30`
- Border: `border-amber-100`
- Badge: "PAUSA ATIVA" (amber)
- Icon: `pause_circle` (amber)

### State: Waiting for Manual Selection
**Condition:** `waitingForManualSelection === true`  
**Screenshot description:** The timer is replaced or overlaid with a pulsing amber banner prompting the user to select the next subject.
- Background: Amber gradient pulse
- Interactions available: Click "Selecionar" to open the Subject Selector.

---

## State Transition Diagram

```text
[Focus Mode] ──── timer ends ────→ [Short/Long Break]
    ↑  │                                │
    │  └──── user pauses ────────┐      │ timer ends
    │                            ↓      │
[Subject Selector] ←──── [Manual Pause] │
    ↑                                   │
    └──────── user selects ─────────────┘
```

---

## Behavior

**On mount:**
- Initializes the timer based on `pomodoroSettings.focusTime`.
- Sets the current subject based on `initialSubjectId` or defaults to the first subject.
- Starts ambient sound if configured and active.

**On prop change:**
- When `pomodoroSettings` change, the timer limits are updated (if not currently transitioning or paused).

**On unmount:**
- Clears all `setInterval` timers.
- Stops ambient audio via `audioService.stopAmbient()`.

**Animations:**
- **Timer Circle:** CSS transition on `strokeDashoffset` to animate the countdown smoothly.
- **Transition Overlay:** A full-screen fade-in/slide-in overlay when switching between focus and breaks (if auto-start is enabled). Duration: 1500ms.
- **Pulse:** The active status dot pulses continuously.

**Internal State:**
```typescript
const [isActive, setIsActive] = useState(true) // Tracks if timer is running
const [timerMode, setTimerMode] = useState<TimerMode>('focus') // Current phase
const [secondsLeft, setSecondsLeft] = useState(pomodoroSettings.focusTime * 60)
const [strictMode, setStrictMode] = useState(false) // Locks navigation
const [completedPomodoros, setCompletedPomodoros] = useState(0)
const [sessionFocusSeconds, setSessionFocusSeconds] = useState(0) // Accumulated study time
```

---

## Children and Composition

### Components rendered by this component
`FocusModeView` renders:
  ├── `SideNavigation` — Mobile and desktop sidebar navigation
  ├── `BottomNav` — Mobile bottom navigation
  ├── `SubjectSelectorOverlay` — Conditional: when user needs to pick a subject
  ├── `MissionReportView` — Conditional: when saving a session
  ├── `StrictModeActivationView` — Conditional: confirming strict mode
  ├── `PomodoroSettingsView` — Conditional: settings overlay
  ├── `PomodoroSoundsView` — Conditional: sounds overlay
  └── `StatCard` — Always: displays mode, total time, and XP

---

## Context Dependencies
- Reads from context: `AppContext` — Uses `isDarkMode` to adjust background classes and SVG stroke colors.

---

## Hook Dependencies
- Uses hooks:
  - `useStudyTimer()` — **[NOT FULLY CONNECTED]** Intended to replace the local `setInterval` logic with the new `SubjectCycleState` data model.
  - `useMemo()` — To compute `modeConfig` (colors, labels, icons based on `timerMode`).
  - `useCallback()` — For `handleTimerComplete` to maintain a stable reference across interval closures.
  - `useEffect()` — Manages the `setInterval` tick, audio playback, and timer completion checks.

---

## Accessibility
- Semantic HTML: Uses `<header>`, `<main>`, `<section>`, and `<button>`.
- Keyboard navigation: Buttons are focusable, but complex overlays (like the queue) may trap focus poorly.
- Focus management: Needs improvement when modals (MissionReport, SubjectSelector) open.

---

## Performance Considerations
- Re-render triggers: The component re-renders every second due to `setSecondsLeft` in the `setInterval`.
- Expensive operations: `modeConfig` is memoized to prevent recalculating styling strings every second.
- Known performance issues: The 1-second interval causes the entire massive component to re-render. Extracting the timer display into a separate `TimerDisplay` component would optimize this.

---

## Usage Examples

**Basic usage:**
```tsx
<FocusModeView 
  subjects={subjects} 
  pomodoroSettings={settings}
  setPomodoroSettings={setSettings}
  onBack={() => navigate('home')}
  onAddXP={(xp) => dispatch(addXp(xp))}
  onRecordSession={(session) => api.save(session)}
/>
```

---

## Anti-patterns

**ANTI-PATTERN 1 — Duplicating Timer Logic**
Problem: Developers might try to read `secondsLeft` from a parent component by lifting state up.
Why it breaks: Lifting a 1-second ticking state to `App.tsx` will cause the entire application tree to re-render every second, destroying performance.
Correct approach: Keep `secondsLeft` strictly local to `FocusModeView` (or a child `TimerDisplay`). Pass completion events up via callbacks (`onRecordSession`).

---

## Integration Points
- Parent must provide: A stable `pomodoroSettings` object and a `subjects` array with at least one item.
- Parent must NOT do: Unmount the component without warning if `sessionFocusSeconds > 0`, as unsaved study time will be lost.

---

## Known Issues

**ISSUE-001 — Timer Logic Duplication**
Severity: High
Description: The component uses local `setInterval` logic instead of the newly created `useStudyTimer` hook.
Trigger: Always present.
Impact: Technical debt. The new `Theme` and `SubjectCycleState` models are not being updated by this view.
Workaround: None.
Fix: Complete T-001 (Data Model Unification) and replace local state with `useStudyTimer`.
Status: Not yet fixed.

**ISSUE-002 — Unsaved Time Loss**
Severity: Medium
Description: If the user refreshes the browser while the timer is running, the current `sessionFocusSeconds` are lost.
Trigger: Page reload during an active session.
Impact: User loses unrecorded study time.
Workaround: Manually pause and save frequently.
Fix: Persist `sessionFocusSeconds` to `localStorage` or `sessionStorage` on every tick, recovering it on mount.
Status: Not yet fixed.

---

## Changelog
- Initial: Created as the core Pomodoro timer view.
- Update: Added Strict Mode functionality.
- Update: Added Mission Report modal for manual session saving.

---

## Screen Layout

```text
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Menu] [Back]    [Mode Title]    [Manual] [Stats] [⚙️]  │
├─────────────────────────────────────────────────────────┤
│ MAIN CONTENT                                            │
│                                                         │
│   [ Stat: Mode ]  [ Stat: Time ]  [ Stat: XP ]          │
│                                                         │
│               ╭─────────────────────╮                   │
│               │      [Icon]         │                   │
│               │      25:00          │                   │
│               │  (•) FOCO ATIVO     │                   │
│               ╰─────────────────────╯                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ BOTTOM NAV (Mobile only)                                │
└─────────────────────────────────────────────────────────┘
```
