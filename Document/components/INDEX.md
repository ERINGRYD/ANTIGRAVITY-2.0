# Component Library Index

**File:** `Document/components/INDEX.md`  
> Total components documented: 2 (Representative Sample)  
> Last updated: March 2026

---

## By Category

### Page Components
| Component | File | Status | Complexity |
|-----------|------|--------|------------|
| FocusModeView | FocusModeView.md | Active | High |
| BattleView | BattleView.md | Active | High |
| StatsPage | StatsPage.md | Active | High |
| VencidosPage | VencidosPage.md | Active | Medium |

### Core Feature Components
| Component | File | Status | Complexity |
|-----------|------|--------|------------|
| SubjectCard | SubjectCard.md | Active | High |
| ThemeChecklist | ThemeChecklist.md | Active | Medium |
| SubtopicRow | SubtopicRow.md | Active | Medium |
| ArchivedEnemyCard | ArchivedEnemyCard.md | Active | Medium |

### Form Components
| Component | File | Status | Complexity |
|-----------|------|--------|------------|
| ThemeCreationForm | ThemeCreationForm.md | Active | Medium |
| SubtopicAddForm | SubtopicAddForm.md | Active | Low |
| ConfidenceSelector | ConfidenceSelector.md | Active | Medium |

### Timer and Session Components
| Component | File | Status | Complexity |
|-----------|------|--------|------------|
| TimerDisplay | TimerDisplay.md | Active | Low |
| TransitionOverlay | TransitionOverlay.md | Active | Medium |
| DecisionPrompt | DecisionPrompt.md | Active | Medium |

### Stats Components
| Component | File | Status | Complexity |
|-----------|------|--------|------------|
| InsightCard | InsightCard.md | Active | Low |
| StatsGeral | StatsGeral.md | Active | Medium |
| StatsBySubject | StatsBySubject.md | Active | Medium |
| StatsConfidence | StatsConfidence.md | Active | Medium |
| StatsErrors | StatsErrors.md | Active | Medium |

---

## By Status

### Active and fully integrated
- App.tsx
- SubjectCard
- FocusModeView
- BattleView
- StatsPage
- VencidosPage
- ThemeChecklist
- SubtopicRow
- ArchivedEnemyCard
- ThemeCreationForm
- SubtopicAddForm
- ConfidenceSelector

### Active but not yet connected to app tree
- TimerDisplay [NOT CONNECTED]
- TransitionOverlay [NOT CONNECTED]
- DecisionPrompt [NOT CONNECTED]

### Partially implemented
- None identified in this pass.

---

## Component Dependency Tree

```text
App.tsx
  ├── Header
  ├── SubjectList
  │     ├── SubjectCard (×N)
  │     │     └── [progress bars, badges]
  │     └── NewSubjectCard
  ├── FocusModeView
  │     ├── TimerDisplay ← useStudyTimer [NOT CONNECTED]
  │     ├── TransitionOverlay ← useAutoCycleTransition [NOT CONNECTED]
  │     └── DecisionPrompt ← useManualCycleDecision [NOT CONNECTED]
  ├── BattleView
  │     ├── QuestionCard
  │     ├── ConfidenceSelector
  │     └── ConfidenceSummary
  ├── VencidosPage
  │     └── ArchivedEnemyCard (×N)
  └── StatsPage
        ├── InsightCard (×4)
        ├── StatsGeral
        ├── StatsBySubject
        ├── StatsByTopic
        ├── StatsConfidence
        ├── StatsErrors
        ├── StatsTimeTotal
        └── StatsTimePerQuestion
```

---

## Documentation Gaps

### Components that exist but are not documented
*Note: Due to the large number of components (~70), only a representative sample (`FocusModeView` and `SubjectCard`) has been fully documented in this pass. The following components meet the criteria but lack individual `.md` files:*

- **App**: The root component. Highly complex, manages all routing and global UI state.
- **BattleView**: Core page for the battle system. High complexity.
- **ThemeChecklist**: Core feature component for managing themes.
- **ArchivedEnemyCard**: Core feature component for the spaced repetition system.
- **ThemeCreationForm**: Complex form component with validation.
- **ConfidenceSelector**: Interactive component with multiple visual states.
- **CycleView**: The main dashboard view showing the study cycle.
- **SubjectDetailView**: Shows details and topics for a specific subject.
- **BattleQuestionView**: Handles the actual combat interface.
- **MissionReportView**: The modal shown after a focus session to save data.

### Components that are documented but may need updates
- **FocusModeView**: Documented, but the internal timer logic is slated to be replaced by `useStudyTimer` (T-001). The documentation will need updating once this refactor is complete.

### Components that should exist but don't
- **TimerDisplay**: The timer logic and UI are currently tightly coupled inside `FocusModeView`. Extracting the visual timer (the SVG circle and time text) into a pure `TimerDisplay` component would significantly improve performance by preventing the entire `FocusModeView` from re-rendering every second.
- **SubjectList**: The logic for rendering and sorting the list of `SubjectCard`s is currently embedded directly in `CycleView` and `App.tsx`. Extracting this would improve reusability.
- **EmptyState**: While an `EmptyState.tsx` exists, it seems underutilized. Many views implement their own custom empty states instead of using a shared component.
