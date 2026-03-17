# Prompt Context Guide

> **Purpose:** Guide for AI-assisted development on this codebase  
> **Audience:** Developers using AI assistants (Claude, GPT, etc.)  
> **Last updated:** March 2026
>
> **TL;DR for experienced developers:**
> 1. Always provide tier-1 docs as context before prompting
> 2. Use incremental prompts — one layer at a time
> 3. Scope every prompt explicitly — say what NOT to change
> 4. Reference existing interfaces by name — never redefine
> 5. Mark stubs as stubs — AI will implement them if you don't

---

## 1. The Documentation Tier System

Before writing any prompt, load the correct documentation tier 
into context. The tier determines what the AI needs to know.

### Tier 1 — Always load (every session)

These documents provide the foundation. Without them, the AI 
makes assumptions that contradict established decisions.

- `Document/PRD.md` — what the product must do
- `Document/GLOBAL.md` — the master roadmap and current phase
- `Document/DATABASE.md` — how data is structured and persisted

Load these FIRST, before any code files.
An AI that knows the decisions will not re-make them differently.

### Tier 2 — Load for planning sessions

Load these when deciding WHAT to build next, not HOW to build it.

- `Document/SPRINT_ATUAL.md` — what is in progress now
- `Document/CHANGELOG.md` — what has already been done
- `Document/API_CONTRACTS.md` — interfaces between layers

### Tier 3 — Load for implementation sessions

Load the SPECIFIC file for the component or hook being worked on.

- `Document/components/[ComponentName].md` — component being modified (e.g., `FocusModeView.md`)
- `Document/HOOKS.md` — if modifying a hook (e.g., `useStudyTimer`)
- `Document/DATABASE.md` — if changing data layer

Do not load all of Tier 3 at once.
Load only what is relevant to the current task.
More context is not always better — irrelevant context
increases the chance of unintended changes.

### Tier 4 — Load for specific concerns

- `Document/STYLE_GUIDE.md` (if it exists) — if making visual changes
- `Document/TESTING.md` (if it exists) — if writing or modifying tests

### Context loading template

Use this template at the start of every session:

```markdown
## Session Context

Task type: [New feature | Bug fix | Refactor | Integration | Visual]
Current phase: [Phase N from GLOBAL.md]
Working on: [ComponentName / HookName / FeatureName]

Documents loaded:
- [ ] PRD.md (Tier 1)
- [ ] GLOBAL.md (Tier 1)  
- [ ] DATABASE.md (Tier 1)
- [ ] [Specific Tier 3 doc for this task, e.g., FocusModeView.md]

Current sprint task: [T-XXX from SPRINT_ATUAL.md]
```

---

## 2. The Incremental Prompting Methodology

This codebase was built using an incremental prompting approach.
Every feature was built in layers, with each prompt depending
on the previous one being complete and verified.

### The principle
- One prompt = one layer
- One layer = one concern
- One concern = one verifiable outcome

Never ask the AI to build an entire feature in one prompt.
Break every feature into layers and prompt for each separately.

### The layer order (always follow this sequence)

**Layer 1 — Data model**
- Define TypeScript interfaces and pure utility functions
- Deliverable: `.ts` file with types and functions only
- Verify: TypeScript compiles, functions are pure

**Layer 2 — Creation/configuration UI**
- Form or flow for creating the data
- Deliverable: React component for input
- Verify: Can create valid data, validation works

**Layer 3 — Business logic**
- Hooks and algorithms that operate on the data
- Deliverable: Custom hooks and utility functions
- Verify: Logic works in isolation (integration test)

**Layer 4 — Display/visualization**
- Components that render the data
- Deliverable: Presentational components
- Verify: All visual states render correctly

**Layer 5 — Integration**
- Connect all layers into the app tree
- Deliverable: Updated parent components with connections
- Verify: Feature works end-to-end from the UI

### Why this order matters
Building display before business logic creates throw-away code.
Building business logic before data models creates type mismatches.
Building integration before display creates untestable connections.
The layer order is not optional — it is a dependency chain.

### Example: adding a new feature correctly

✅ **CORRECT sequence:**
- Prompt 1: "Define the TypeScript interface for `SubjectCycleState`"
- Prompt 2: "Build the `ThemeCreationForm` component"
- Prompt 3: "Implement the `useStudyTimer` hook"
- Prompt 4: "Build the `SubjectCard` display component"
- Prompt 5: "Connect `SubjectCard` and `useStudyTimer` to `FocusModeView`"

❌ **INCORRECT sequence:**
- Prompt 1: "Build the complete new study cycle feature including data model, form, timer hook, cards, and integration into FocusModeView."
- Result: Inconsistent types, missing edge cases, integration that assumes wrong interfaces.

---

## 3. Prompt Structure Templates

### Template 1 — New feature prompt
```markdown
You are an expert React/TypeScript developer.
Your task is strictly limited to [specific deliverable].
Do not implement [explicitly excluded scope].

## Context
[2-3 sentences about what already exists that this builds on.
Reference specific file names and function names.]

## What already exists (do not recreate)
- [InterfaceName] in [file] — [what it does]
- [functionName] in [file] — [what it does]
- [ComponentName] in [file] — [what it does]

## What needs to be built
[Precise description of the deliverable]

## Specifications
[Exact requirements — numbered, specific, testable]

## Constraints
- Do not modify [specific files that must not change]
- Do not introduce [specific patterns to avoid]
- Use [specific existing utility/component/type]
- Do not alter [specific interfaces]

## Output
Deliver only [X]. Add comment block explaining [Y].
```

### Template 2 — Bug fix prompt
```markdown
You are an expert frontend developer.
Fix a specific bug in [file]. 
Change ONLY what is necessary to fix the bug.
Do not refactor, rename, or restructure anything else.

## Bug description
Symptom: [what the user or developer observes]
Location: [exact file and approximate line]
Root cause: [what is actually wrong — if known]

## What is working correctly (do not change)
- [Feature 1]: works as expected
- [Feature 2]: works as expected

## The fix
[Describe exactly what needs to change]

## Acceptance criteria
- [ ] [Specific verifiable condition that proves the bug is fixed]
- [ ] [No regression in feature X]
- [ ] [No regression in feature Y]

## Output
Deliver the corrected file with:
1. A comment above the fix: // FIX: [what was wrong]
2. No other changes
```

### Template 3 — Integration prompt
```markdown
You are an expert frontend developer.
Connect [ModuleA] to [ModuleB] in [ParentComponent].
Do not modify ModuleA or ModuleB — only modify ParentComponent
and any adapter code needed to bridge them.

## What exists (do not modify these files)
- [ModuleA] in [file]: [what it does, its interface]
- [ModuleB] in [file]: [what it does, its interface]

## The connection required
[Describe exactly what data flows from A to B and when]

## Adapter requirements (if needed)
[If the two interfaces are incompatible, describe the bridge]

## What must remain working after integration
- [Feature 1]: must continue to work
- [Feature 2]: must continue to work

## Output
Deliver:
1. Modified [ParentComponent] with connection implemented
2. Adapter file (if needed)
3. Comment block: // INTEGRATION: [what was connected and why]
```

### Template 4 — Visual/styling prompt
```markdown
You are an expert UI/UX developer.
Apply visual changes to [Component].
Change ONLY styling — do not alter any logic, props, or behavior.

## Design system constraints (DO NOT MODIFY)
[Paste the design system constraints block from Context Snippets]

## Current visual problem
[Describe what looks wrong and why]

## Required visual changes
[List exact changes — colors, sizes, spacing, animations]

## What must NOT change
- Component logic
- Props interface
- Any behavior
- Any other component's appearance

## Output
Deliver only the updated component with styling changes.
Comment each change: // VISUAL: [what changed and why]
```

### Template 5 — Refactoring prompt
```markdown
You are an expert TypeScript engineer.
Refactor [specific code] in [file].
The refactor must be behavior-preserving — 
no user-visible changes, no logic changes.

## What is being refactored
[Describe the current code and its problem]

## Refactoring goal
[What the code should look like after — simpler / more type-safe / etc.]

## Behavior contract (must be identical before and after)
- [Behavior 1]: must work exactly as before
- [Behavior 2]: must work exactly as before

## Out of scope
- Do not change any component that uses this code
- Do not change any tests that test this code
- Do not change any types that this code depends on

## Verification
[How to verify the refactor preserved behavior]

## Output
Deliver the refactored code with:
1. Comment explaining what changed structurally
2. Comment confirming what behavior was preserved
```

---

## 4. High-Risk Prompt Patterns

Patterns that have caused problems in this codebase.
Avoid these in every prompt.

### RISK-001 — Implicit scope expansion
- **Pattern:** Asking for a feature without explicit boundaries
- **What the AI does:** Refactors related code, renames things, "improves" unrelated components, adds imports
- **Damage:** Breaks working code, creates regressions
- ❌ **Dangerous:** "Add a progress bar to the subject card"
- ✅ **Safe:** "Add a progress bar to `SubjectCard.tsx`. Do not modify any other component. Do not change the `SubjectCardProps` interface. Do not change any existing logic in `SubjectCard`."

### RISK-002 — Redefining existing interfaces
- **Pattern:** Not providing existing type definitions in context
- **What the AI does:** Creates new interfaces that conflict with existing ones, causing type errors
- **Damage:** Type mismatches, parallel model proliferation
- ❌ **Dangerous:** "Build a component that displays Theme data" (without providing the Theme interface)
- ✅ **Safe:** "Build a component that displays Theme data. Use the `Theme` interface from `src/types/theme.types.ts` exactly. Do not create a new `Theme` type — use the existing one."

### RISK-003 — Implementing stubs
- **Pattern:** Not marking stub functions as intentionally incomplete
- **What the AI does:** Implements the stub with invented logic
- **Damage:** Business logic invented without specification
- ❌ **Dangerous prompt when stub exists:** "Fix the timer integration in FocusModeView"
- ✅ **Safe:** "The `useStudyTimer` hook inside `FocusModeView` is intentionally a stub waiting for T-001 to complete. Do not implement its internal logic. Only connect its returned `secondsLeft` to the UI."

### RISK-004 — Design system bypass
- **Pattern:** Not specifying design system constraints
- **What the AI does:** Introduces new colors, new component libraries, new CSS patterns that break visual consistency
- **Damage:** Visual inconsistency, new dependencies
- ❌ **Dangerous:** "Make the SubjectCard look better"
- ✅ **Safe:** "Improve the SubjectCard visual according to these constraints: [paste design system block]. Use ONLY existing Tailwind colors (slate, blue, emerald). Do not introduce new CSS classes or variables. Do not import new libraries."

### RISK-005 — Async function introduction
- **Pattern:** Not specifying sync vs async requirements
- **What the AI does:** Makes `localStorage` functions async, adds unnecessary Promises, changes function signatures
- **Damage:** Breaks all call sites, adds overhead
- ❌ **Dangerous:** "Update the `saveArchivedEnemy` function to handle the new fields"
- ✅ **Safe:** "Update the `saveArchivedEnemy` function to handle the new fields. This function uses `localStorage` (synchronous) — keep it synchronous. Do not add async/await. Do not change the function signature."

### RISK-006 — Type safety regression
- **Pattern:** Not explicitly forbidding `as any`
- **What the AI does:** Uses `as any` to resolve type conflicts
- **Damage:** Silently breaks type safety, hides real mismatches
- **Always add to every prompt:** "Do not use `as any`, `as unknown`, or any type assertion to resolve type conflicts. If types conflict, report the conflict — do not cast around it."

### RISK-007 — Parallel model confusion
- **Pattern:** Not specifying which data model to use
- **What the AI does:** Mixes legacy (`Subject`/`Topic`) and new (`Theme`/`SubjectCycleState`) models
- **Damage:** Inconsistent data flow, broken integration
- **Always specify when working near data:** 
  "Use the LEGACY model (`Subject`, `Topic` from `src/types/types.ts`) for `App.tsx` and `FocusModeView.tsx`."
  OR
  "Use the NEW model (`Theme`, `SubjectCycleState` from `src/types/theme.types.ts`) for hook implementations."
  "Never mix without using the adapter: `src/adapters/subjectToTheme.ts`"

---

## 5. Context Snippets Library

Pre-written context blocks to paste into prompts.
These ensure consistency across sessions.

### Snippet 1 — Design system constraints
```markdown
## DESIGN SYSTEM — DO NOT MODIFY

Colors (Tailwind):
- Primary accent: `blue-500` to `blue-600`
- Success: `emerald-500`
- Warning: `amber-500`
- Error: `red-500`
- Background: `slate-50` (light) / `slate-950` (dark)
- Card background: `white` (light) / `slate-900` (dark)
- Text primary: `slate-900` (light) / `slate-50` (dark)
- Text secondary: `slate-500` (light) / `slate-400` (dark)
- Subject color: `subject.color` (from data — never hardcoded, applied via inline style for borders/backgrounds)

Card pattern:
- White/Slate-900 background, subtle border-radius (`rounded-xl`), soft shadow (`shadow-sm`)
- Left vertical border: `border-l-[8px]` with `borderColor: subject.color`
- Progress bars: height 6px (cycle) / 4px (content), pill shape (`rounded-full`)

Rules:
- Do not introduce new hex colors, stick to Tailwind's default palette.
- Do not import new icon libraries (use Google Material Symbols/Icons if already in project).
- Do not introduce custom CSS files. Use Tailwind utility classes.
```

### Snippet 2 — Type safety constraints
```markdown
## TYPE SAFETY CONSTRAINTS

- Do not use `as any` under any circumstance
- Do not use `as unknown` to work around type errors
- Do not use `@ts-ignore`
- If types conflict, report the conflict — do not cast around it
- All new interfaces must extend or compose existing ones
- Do not redefine interfaces that exist in:
  - `src/types/types.ts` (legacy model)
  - `src/types/theme.types.ts` (new model)
  - `src/types/subjectCycle.types.ts` (cycle state)
```

### Snippet 3 — Pure function constraints
```markdown
## PURE FUNCTION CONSTRAINTS

The following functions MUST remain pure (no side effects):
- `calculateWeightedScore()`
- `classifyEnemyRoom()`
- `getAttemptWeight()`
- `calculateRetention()`
- `resolveNextSubject()`
- [all functions in `src/utils/statsCalculations.ts`]

Pure means:
- Same inputs always produce same outputs
- No `localStorage` reads or writes
- No React state mutations
- No API calls
- No `console.log` (except temporary debugging)

If a modification requires side effects, extract them to a separate non-pure function and keep the core logic pure.
```

### Snippet 4 — Data model context
```markdown
## DATA MODEL CONTEXT

TWO PARALLEL MODELS EXIST — use the correct one:

LEGACY MODEL (source of truth for App.tsx, FocusModeView):
- `Subject` in `src/types/types.ts`
- `Topic` in `src/types/types.ts`
- Storage: `localStorage` 'subjects'

NEW MODEL (use for hooks and new features):
- `Theme` in `src/types/theme.types.ts`
- `Subtopic` in `src/types/theme.types.ts`
- `SubjectCycleState` in `src/types/subjectCycle.types.ts`
- Storage: not yet fully persisted

BRIDGE:
- `src/adapters/subjectToTheme.ts` converts Legacy → New
- Use this adapter when new hooks need to consume legacy data

NEVER mix models without the adapter.
NEVER create a third parallel model.
```

### Snippet 5 — Incremental scope constraint
```markdown
## SCOPE CONSTRAINT

This prompt covers ONLY [specific layer/feature/file].

Do not modify:
- Any file not listed in "Files to modify" below
- Any TypeScript interface defined outside this task
- Any existing business logic not directly related to this task
- Any visual styling not specified in this task
- Any test files

If you identify something that should be changed but is outside this scope, add it as a comment:
// OUT OF SCOPE: [description] — address in separate prompt
```

---

## 6. Session Workflow

### Starting a session
1. Read `SPRINT_ATUAL.md` — identify the current task.
2. Read `GLOBAL.md` — confirm current phase and priorities.
3. Load Tier 1 docs into context.
4. Load specific Tier 3 doc for the component/hook being worked on.
5. Write the prompt using the correct template.
6. Add relevant context snippets.
7. Review the prompt against the RISK checklist before sending.

### During a session
If the AI output is:
- **Correct and scoped** → accept and move to next layer.
- **Correct but over-scoped** → accept the needed parts only, ask AI to revert the extras.
- **Incorrect** → identify which layer the error is in, re-prompt with more specific constraints.
- **Type errors** → add the missing type context and re-prompt.

### Ending a session
1. Verify the completed task against acceptance criteria.
2. Update `SPRINT_ATUAL.md` — move task to Done.
3. Add entry to `CHANGELOG.md`.
4. If a new architectural decision was made → add to `DECISIONS.md` (or `GLOBAL.md`).
5. If a new component was built → create `Document/components/[Name].md`.
6. If an interface changed → update `API_CONTRACTS.md`.

### Prompt review checklist
Before sending any prompt, verify:
- [ ] Tier 1 docs are loaded in context
- [ ] Specific component/hook doc is loaded (if modifying existing)
- [ ] Existing interfaces are referenced by name (not redefined)
- [ ] Scope is explicitly constrained (files NOT to touch)
- [ ] Design system snippet is included (if visual changes)
- [ ] Type safety constraints are included
- [ ] Pure function constraint is included (if touching utils)
- [ ] Data model context is included (if touching data layer)
- [ ] Stubs are marked as stubs (not to be implemented)
- [ ] Output format is specified (what to deliver, how)

---

## 7. Task-Type Reference

Quick reference for which templates and snippets to use:

| Task type | Template | Required snippets | Load from Tier 3 |
|-----------|----------|-------------------|------------------|
| New data model | T1 | Type safety, Scope | DATABASE.md |
| New component | T1 | Design system, Type safety, Scope | Component doc if modifying existing |
| New hook | T1 | Pure functions, Type safety, Scope | HOOKS.md |
| Bug fix | T2 | Scope | Component or hook doc |
| Integration | T3 | Data model, Type safety, Scope | Both component docs |
| Visual change | T4 | Design system, Scope | Component doc |
| Refactor | T5 | Type safety, Scope | Component or hook doc |
| New page | T1 | Design system, Type safety, Data model, Scope | GLOBAL.md |

---

## 8. Codebase-Specific Conventions for AI Prompts

Conventions established through development of this codebase.
Every AI prompt should follow these.

### Naming conventions to specify in prompts
- **Components:** PascalCase (`SubjectCard`, `FocusModeView`)
- **Hooks:** camelCase with `use` prefix (`useStudyTimer`, `useApp`)
- **Utilities:** camelCase (`calculateWeightedScore`)
- **Types/Interfaces:** PascalCase (`Theme`, `SubjectCycleState`)
- **Constants:** SCREAMING_SNAKE_CASE (`WEIGHT_MATRIX`)
- **Event handlers in components:** `handleX` (`handleTimerComplete`)
- **Callback props:** `onX` (`onRecordSession`, `onAddXP`)
- **Boolean props:** `isX` or `hasX` (`isActive`, `isPermanentlyCompleted`)

### Comment conventions to specify in prompts
- `// WHY:` [explanation of non-obvious decision]
- `// FIX:` [what was wrong and what was changed]
- `// TODO:` [what needs to be done and why it is deferred]
- `// INTEGRATION:` [what connects to what]
- `// OUT OF SCOPE:` [what was identified but not changed]
- `// PURE:` [marks a function as having no side effects]
- `// TEMPORARY:` [marks adapter/bridge code that will be removed]

### File organization to specify in prompts
- Types only → `src/types/[name].types.ts`
- Pure utilities → `src/utils/[name].ts`
- Custom hooks → `src/hooks/use[Name].ts`
- Components → `src/components/[Name].tsx` (or `src/components/[Name]/index.tsx`)
- Page views → `src/components/[Name]View.tsx` or `src/components/[Name]Page.tsx`
- Adapters → `src/adapters/[sourceToTarget].ts`
- Context → `src/context/[Name]Context.tsx`

---

## 9. Lessons Learned

Hard-won lessons from developing this codebase with AI.
Each lesson corresponds to a real problem that occurred.

### LESSON-001 — Always specify what NOT to change
AI assistants optimize for "helpful" — they will improve things they were not asked to improve. This is more dangerous than doing nothing because it creates unexpected side effects.
**Rule:** Every prompt must contain a "Do not modify" section listing at least 2-3 specific things that must not change (e.g., "Do not modify `App.tsx` routing logic").

### LESSON-002 — Reference interfaces by name, never describe them
If you describe an interface instead of referencing the existing one by name, the AI creates a new slightly-different version. Two similar interfaces will cause type errors immediately or subtly break data flow later.
**Rule:** Always load the type file and say "Use the `SubjectCycleState` from `src/types/subjectCycle.types.ts` exactly."

### LESSON-003 — Mark dead code explicitly
If unused code exists (like `useStudyTimer` currently not connected in `FocusModeView`), the AI will either delete it (thinking it is garbage) or implement it in ways inconsistent with the plan.
**Rule:** Always note "This hook/component is intentionally unused — it will be connected in a future prompt (T-001). Do not delete it. Do not implement its stubs."

### LESSON-004 — Design changes require explicit constraints
When asking for visual improvements without design system constraints, the AI produces a completely different visual language — new colors, new spacing, new component patterns.
**Rule:** Always paste the full design system snippet when requesting any visual change. Stick to the Tailwind palette used in the project.

### LESSON-005 — Incremental prompts are faster than large ones
A single large prompt that produces incorrect output requires reading the entire output, identifying all errors, and re-prompting. An incremental prompt that produces a small incorrect output is easy to identify and correct.
**Rule:** If a prompt takes more than 15 minutes to verify, it was too large. Break it into smaller prompts next time.

### LESSON-006 — Specify sync vs async explicitly
JavaScript allows any function to be async, and AI will make functions async "just in case" — especially for operations that look like they might be I/O. `localStorage` is synchronous but looks like database access.
**Rule:** Always specify "this function is synchronous — do not add async/await" when working with `localStorage` (e.g., saving `Subject` data).

### LESSON-007 — State management changes propagate everywhere
Changing how state is managed (e.g., modifying `AppContext` or `useApp`) ripples through every consumer. AI will update the immediate file but miss distant consumers.
**Rule:** Before prompting for state management changes, list every file that consumes the state. Require the AI to update all of them in the same prompt.

---

## Prompt Templates Quick Reference

A one-page cheat sheet for the most common tasks:

### New feature (incremental)
1. Prompt 1: Data model only → verify types compile
2. Prompt 2: Creation UI only → verify form works
3. Prompt 3: Business logic only → verify in isolation
4. Prompt 4: Display components → verify all states render
5. Prompt 5: Integration → verify end-to-end

### Bug fix
1. Load: component doc + relevant hook doc
2. Describe: symptom, location, root cause (if known)
3. Specify: what is working (must not regress)
4. Constrain: change only the minimum necessary
5. Verify: specific acceptance criteria

### Visual change  
1. Load: component doc + `STYLE_GUIDE.md` (or Design Snippet)
2. Paste: full design system snippet
3. Describe: specific visual problem
4. List: exact changes needed
5. Forbid: logic changes, new libraries, new colors

### Integration
1. Load: both module docs + `API_CONTRACTS.md`
2. Provide: exact interfaces of both modules
3. Describe: what data flows and when
4. Constrain: do not modify either module — only the bridge
5. Verify: both modules still work independently after

---

*Keep this cheat sheet on screen during every development session.*
