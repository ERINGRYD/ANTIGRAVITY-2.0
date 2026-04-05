import { KnowledgeLevel } from '../utils/priorityUtils';

/**
 * Theme Data Model Definition
 * 
 * Design Decisions:
 * 1. Separation of Concerns: Themes track content progress (accumulatedTime), while Subjects track cycle balance.
 * 2. Dual Completion Strategy: Themes can be completed either by hitting a time goal OR by finishing a checklist.
 *    This flexibility supports both "study for X hours" and "finish these topics" methodologies.
 * 3. Source Tracking: We explicitly track HOW a completion happened (time vs checklist vs questions) to enable
 *    future features like "XP calculation rules" (e.g., manual-known awards 0 XP) and "smart reviews".
 * 4. Flat Structure: The model is kept flat and serializable for easy storage in local storage or databases.
 * 5. Derived State: Subject completion is always computed from themes, ensuring single source of truth.
 */

export interface Subtopic {
  id: string;
  name: string;
  isCompleted: boolean;
  /**
   * Source of completion determines XP awards and revertibility:
   * - 'manual-known': User knew this beforehand. 0 XP. Revertible.
   * - 'manual-study': User studied and marked done. Standard XP. Revertible.
   * - 'questions': System auto-completed based on performance. High XP. Read-only.
   * - null: Not completed.
   */
  completionSource: 'manual-known' | 'manual-study' | 'questions' | null;
}

export interface Theme {
  id: string;
  subjectId: string;           // Reference to parent Subject
  name: string;
  order: number;               // Sort order within the subject
  
  /** Target study time in minutes to consider this theme "learned" via time method */
  goalTime: number;            
  
  priority: 1 | 2 | 3 | 4 | 5; // Star priority inherited from parent subject on creation
  
  /** Total minutes studied across ALL history. Does not reset on cycle rotation. */
  accumulatedTime: number;     
  
  /** True if completed by ANY valid source. Persists across cycles. */
  isCompleted: boolean;        
  
  /**
   * The primary reason this theme is considered complete:
   * - 'time': accumulatedTime >= goalTime
   * - 'checklist': All subtopics are completed (if subtopics exist)
   * - 'questions': Auto-completed by mastery system (future)
   * - null: In progress
   */
  completionSource: 'time' | 'checklist' | 'questions' | null;
  
  /** Optional breakdown of the theme. If empty, only 'time' or manual completion applies. */
  subtopics: Subtopic[];       
  
  knowledgeLevel?: KnowledgeLevel;
  description?: string;

  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
}

/**
 * Evaluates if a theme is completed based on active rules.
 * A theme is complete if:
 * 1. It has already been marked complete (persistence)
 * 2. Accumulated time meets or exceeds the goal
 * 3. It has subtopics AND all of them are marked complete
 * 
 * @param theme The theme to evaluate
 * @returns boolean True if the theme meets any completion criteria
 */
export function isThemeCompleted(theme: Theme): boolean {
  // 1. Persistence check
  if (theme.isCompleted) return true;

  // 2. Time-based completion
  if (theme.accumulatedTime >= theme.goalTime) return true;

  // 3. Checklist-based completion
  // Only applies if subtopics exist. An empty subtopic list cannot trigger checklist completion automatically.
  if (theme.subtopics.length > 0) {
    const allSubtopicsComplete = theme.subtopics.every(s => s.isCompleted);
    if (allSubtopicsComplete) return true;
  }

  return false;
}

/**
 * Determines if a Subject is permanently completed based on its themes.
 * A Subject is complete ONLY if:
 * 1. It has at least one theme (empty subjects are not "complete", they are "empty")
 * 2. ALL of its themes are marked as completed
 * 
 * @param themes The array of themes belonging to a subject
 * @returns boolean True if the subject is fully mastered
 */
export function isSubjectCompleted(themes: Theme[]): boolean {
  if (!themes || themes.length === 0) return false;

  return themes.every(theme => isThemeCompleted(theme));
}
