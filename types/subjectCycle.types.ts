/**
 * Subject Cycle State Data Model
 * 
 * Architecture: Two-Counter System
 * 
 * This model implements the "Cycle Time" counter, which is distinct from the "Theme Accumulated Time" counter.
 * 
 * 1. Cycle Time (SubjectCycleState.currentCycleTime):
 *    - Tracks the user's dedication balance across subjects within a single rotation.
 *    - It is CAPPED at cycleGoalTime. Once the goal is reached, this counter stops.
 *    - Excess time is tracked separately in `excessTime`.
 *    - Resets to 0 at the start of every new rotation.
 * 
 * 2. Theme Accumulated Time (Theme.accumulatedTime - handled elsewhere):
 *    - Tracks content mastery.
 *    - Never stops counting (even during excess time).
 *    - Never resets between rotations.
 * 
 * Why cap currentCycleTime?
 * To ensure the cycle completion percentage (0-100%) reflects the *balance* of the study plan.
 * Studying 2 hours of Math when the goal was 1 hour shouldn't make the cycle "150% complete",
 * nor should it hide the fact that Physics is still at 0%.
 */

export interface SubjectCycleState {
  subjectId: string;           // Reference to the parent Subject
  rotationIndex: number;       // The current rotation number (1, 2, 3...)
  
  cycleGoalTime: number;       // Target minutes for this subject in this specific rotation
  
  /**
   * Time accumulated towards the cycle goal.
   * CAPPED at cycleGoalTime.
   * Resets on new rotation.
   */
  currentCycleTime: number;    
  
  /**
   * Time studied AFTER the cycle goal was reached.
   * Only increments when currentCycleTime === cycleGoalTime.
   * Resets on new rotation.
   */
  excessTime: number;          
  
  activeThemeId: string | null; // The theme currently being studied in this session
  
  isRotationCompleted: boolean; // True when currentCycleTime >= cycleGoalTime
  
  startedAt: string | null;    // ISO date string - when this rotation started
  completedAt: string | null;  // ISO date string - when goal was first reached
}

/**
 * Returns how much time remains before cycleGoalTime is reached.
 * Returns 0 if already completed.
 */
export function getCycleTimeRemaining(state: SubjectCycleState): number {
  return Math.max(0, state.cycleGoalTime - state.currentCycleTime);
}

/**
 * Returns the cycle completion percentage (0 to 100).
 * Based only on currentCycleTime vs cycleGoalTime.
 * Never exceeds 100 — excessTime does not count toward percentage.
 */
export function getCycleProgressPercentage(state: SubjectCycleState): number {
  if (state.cycleGoalTime <= 0) return 0;
  
  const percentage = (state.currentCycleTime / state.cycleGoalTime) * 100;
  return Math.min(100, Math.round(percentage));
}

/**
 * Creates a fresh SubjectCycleState for a new rotation.
 * 
 * IMPORTANT: This function does NOT reset Theme.accumulatedTime.
 * Theme progress is permanent and must be preserved across rotations.
 * This only resets the cycle-specific counters.
 */
export function createNewRotationState(
  subjectId: string,
  cycleGoalTime: number,
  rotationIndex: number
): SubjectCycleState {
  return {
    subjectId,
    rotationIndex,
    cycleGoalTime,
    currentCycleTime: 0,
    excessTime: 0,
    activeThemeId: null,
    isRotationCompleted: false,
    startedAt: new Date().toISOString(),
    completedAt: null
  };
}

/**
 * Applies one time increment (1 minute) to the state.
 * Returns a new state object — does not mutate the input.
 * 
 * Logic:
 * - If currentCycleTime < cycleGoalTime: Increment currentCycleTime.
 * - If currentCycleTime >= cycleGoalTime: Increment excessTime.
 * 
 * NOTE: This function does NOT handle Theme.accumulatedTime updates.
 * That must be handled by a separate call to the Theme model updater.
 */
export function applyTimeIncrement(state: SubjectCycleState): SubjectCycleState {
  // Create a shallow copy to ensure immutability
  const newState = { ...state };

  // If goal is not yet reached, increment cycle time
  if (newState.currentCycleTime < newState.cycleGoalTime) {
    newState.currentCycleTime += 1;
    
    // Check if this specific increment completed the rotation
    if (newState.currentCycleTime >= newState.cycleGoalTime) {
      newState.isRotationCompleted = true;
      // Only set completedAt if it wasn't already set (idempotency)
      if (!newState.completedAt) {
        newState.completedAt = new Date().toISOString();
      }
    }
  } else {
    // Goal already reached, increment excess time
    newState.excessTime += 1;
  }

  return newState;
}
