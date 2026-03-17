/**
 * useStudyTimer Hook
 * 
 * Architecture: Dual-Counter System
 * 
 * This hook manages two independent time counters simultaneously:
 * 1. Cycle Time (SubjectCycleState): Tracks progress towards the cycle goal. Capped at the goal.
 * 2. Theme Time (Theme.accumulatedTime): Tracks total content mastery. Never capped.
 * 
 * Tick Logic:
 * - 1-second tick: Updates local state for UI display (elapsedSeconds, cycleTimeSeconds, themeTimeSeconds).
 * - 60-second tick: Calls onTick with updated data objects for persistence.
 * 
 * Why two ticks?
 * We need 1-second resolution for a responsive UI timer, but we only persist study data
 * in 1-minute increments to match the data model (which stores minutes).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SubjectCycleState, applyTimeIncrement } from '../types/subjectCycle.types';
import { Theme } from '../types/theme.types';

export interface StudyTimerState {
  isRunning: boolean;
  elapsedSeconds: number;          // Total seconds elapsed in current session
  cycleTimeSeconds: number;        // Mirrors currentCycleTime in seconds (capped)
  themeTimeSeconds: number;        // Mirrors Theme.accumulatedTime in seconds (uncapped)
  isGoalReached: boolean;          // True when cycleGoalTime is reached
  excessSeconds: number;           // Time beyond cycleGoalTime in seconds
}

interface UseStudyTimerProps {
  subjectCycleState: SubjectCycleState;
  activeTheme: Theme;
  onCycleGoalReached: () => void;
  onTick: (
    updatedCycleState: SubjectCycleState,
    updatedTheme: Theme
  ) => void;
}

interface UseStudyTimerReturn {
  timerState: StudyTimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export const useStudyTimer = ({
  subjectCycleState,
  activeTheme,
  onCycleGoalReached,
  onTick
}: UseStudyTimerProps): UseStudyTimerReturn => {
  // Initialize state based on props
  const [timerState, setTimerState] = useState<StudyTimerState>({
    isRunning: false,
    elapsedSeconds: 0,
    cycleTimeSeconds: subjectCycleState.currentCycleTime * 60,
    themeTimeSeconds: activeTheme.accumulatedTime * 60,
    isGoalReached: subjectCycleState.isRotationCompleted,
    excessSeconds: subjectCycleState.excessTime * 60
  });

  // Refs to hold mutable state for the interval closure
  // This prevents the interval from needing to be recreated on every tick
  const stateRef = useRef(timerState);
  const propsRef = useRef({ subjectCycleState, activeTheme, onCycleGoalReached, onTick });

  // Update refs when props or state change
  useEffect(() => {
    stateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    propsRef.current = { subjectCycleState, activeTheme, onCycleGoalReached, onTick };
  }, [subjectCycleState, activeTheme, onCycleGoalReached, onTick]);

  // Timer Interval Logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (timerState.isRunning) {
      intervalId = setInterval(() => {
        const currentState = stateRef.current;
        const currentProps = propsRef.current;
        
        const cycleGoalSeconds = currentProps.subjectCycleState.cycleGoalTime * 60;
        
        // Calculate new values
        const newElapsed = currentState.elapsedSeconds + 1;
        const newThemeTime = currentState.themeTimeSeconds + 1;
        
        let newCycleTime = currentState.cycleTimeSeconds;
        let newExcess = currentState.excessSeconds;
        let newIsGoalReached = currentState.isGoalReached;

        // Check if goal is reached (or was already reached)
        if (newCycleTime < cycleGoalSeconds) {
          newCycleTime += 1;
          
          // Check if this specific second triggered the goal
          if (newCycleTime >= cycleGoalSeconds) {
            newIsGoalReached = true;
            // Call the callback only once when the transition happens
            if (!currentState.isGoalReached) {
              currentProps.onCycleGoalReached();
            }
          }
        } else {
          // Goal already reached, increment excess
          newExcess += 1;
          newIsGoalReached = true;
        }

        // Update local state for UI
        setTimerState(prev => ({
          ...prev,
          elapsedSeconds: newElapsed,
          cycleTimeSeconds: newCycleTime,
          themeTimeSeconds: newThemeTime,
          isGoalReached: newIsGoalReached,
          excessSeconds: newExcess
        }));

        // 60-Second Persistence Tick
        // We check if elapsedSeconds is a multiple of 60
        if (newElapsed > 0 && newElapsed % 60 === 0) {
          // 1. Update Cycle State using the pure utility function
          // We pass the *original* state from props because applyTimeIncrement handles the increment logic
          // However, applyTimeIncrement increments by 1 minute based on the state passed to it.
          // Since we are maintaining state in the hook, we should ideally apply increments cumulatively.
          // But the prompt says "The 60-second interval uses applyTimeIncrement... and increments Theme.accumulatedTime by 1".
          // This implies we take the *latest known persisted state* (from props) and add 1 minute to it.
          // NOTE: This assumes the parent component updates the props.subjectCycleState when onTick is called.
          
          const updatedCycleState = applyTimeIncrement(currentProps.subjectCycleState);
          
          // 2. Update Theme State (manual increment as per prompt)
          const updatedTheme: Theme = {
            ...currentProps.activeTheme,
            accumulatedTime: currentProps.activeTheme.accumulatedTime + 1,
            updatedAt: new Date().toISOString()
          };

          currentProps.onTick(updatedCycleState, updatedTheme);
        }

      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerState.isRunning]); // Only re-run if isRunning changes

  // Controls
  const start = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    // Need to use the ref because this callback might be stale if not updated
    // But useCallback with empty deps is fine if we use the ref inside, OR we can just use the latest propsRef
    const currentProps = propsRef.current;
    
    setTimerState({
      isRunning: false,
      elapsedSeconds: 0,
      cycleTimeSeconds: currentProps.subjectCycleState.currentCycleTime * 60, // Reset to persisted state
      themeTimeSeconds: currentProps.activeTheme.accumulatedTime * 60, // Reset to persisted state
      isGoalReached: currentProps.subjectCycleState.isRotationCompleted,
      excessSeconds: currentProps.subjectCycleState.excessTime * 60
    });
  }, []);

  return {
    timerState,
    start,
    pause,
    reset
  };
};
