/**
 * useAutoCycleTransition Hook
 * 
 * Logic Sequence:
 * 1. Goal Reached -> 'waiting-pomodoro' (Wait for Pomodoro to finish)
 * 2. Pomodoro Complete -> 'countdown' (10s countdown to next subject)
 * 3. Countdown Zero -> 'advancing' (Trigger onAdvance)
 * 
 * Why Gate with Pomodoro?
 * We never interrupt a focused Pomodoro session. Even if the cycle goal is met,
 * the user should finish their current "tomato" before switching context.
 * This respects the flow state while enforcing the cycle structure.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, isThemeCompleted } from '../types/theme.types';

export type TransitionPhase = 'idle' | 'waiting-pomodoro' | 'countdown' | 'advancing';

export interface AutoCycleTransitionState {
  phase: TransitionPhase;
  countdownSeconds: number;
  themeIsComplete: boolean;
  nextSubjectName: string | null; // Placeholder for future integration
}

interface UseAutoCycleTransitionProps {
  isAutoCycle: boolean;
  isPomodoroComplete: boolean;
  activeTheme: Theme | null;
  onAdvance: () => void;
  onTransitionCancelled: () => void;
}

interface UseAutoCycleTransitionReturn {
  transitionState: AutoCycleTransitionState;
  triggerTransition: () => void; // Called by parent when goal is reached
  cancelTransition: () => void;
}

export const useAutoCycleTransition = ({
  isAutoCycle,
  isPomodoroComplete,
  activeTheme,
  onAdvance,
  onTransitionCancelled
}: UseAutoCycleTransitionProps): UseAutoCycleTransitionReturn => {
  const [state, setState] = useState<AutoCycleTransitionState>({
    phase: 'idle',
    countdownSeconds: 10,
    themeIsComplete: false,
    nextSubjectName: null
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger the transition sequence (Step 1)
  const triggerTransition = useCallback(() => {
    if (!isAutoCycle) return;

    const isComplete = activeTheme ? isThemeCompleted(activeTheme) : false;
    
    setState(prev => ({
      ...prev,
      phase: 'waiting-pomodoro',
      themeIsComplete: isComplete,
      countdownSeconds: 10 // Reset countdown
    }));
  }, [isAutoCycle, activeTheme]);

  // Handle Pomodoro Completion (Step 2)
  useEffect(() => {
    if (state.phase === 'waiting-pomodoro' && isPomodoroComplete) {
      setState(prev => ({ ...prev, phase: 'countdown' }));
    }
  }, [state.phase, isPomodoroComplete]);

  // Handle Countdown (Step 2 -> 3)
  useEffect(() => {
    if (state.phase === 'countdown') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.countdownSeconds <= 1) {
            // Countdown finished
            return { ...prev, phase: 'advancing', countdownSeconds: 0 };
          }
          return { ...prev, countdownSeconds: prev.countdownSeconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  // Handle Advance (Step 3)
  useEffect(() => {
    if (state.phase === 'advancing') {
      // Clear interval just in case
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Trigger advance
      onAdvance();
      
      // Reset to idle after a brief delay to allow UI to show "Advancing..."
      const timeoutId = setTimeout(() => {
        setState(prev => ({ ...prev, phase: 'idle', countdownSeconds: 10 }));
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [state.phase, onAdvance]);

  // Cancel Transition
  const cancelTransition = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => ({ ...prev, phase: 'idle', countdownSeconds: 10 }));
    onTransitionCancelled();
  }, [onTransitionCancelled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    transitionState: state,
    triggerTransition,
    cancelTransition
  };
};
