/**
 * useManualCycleDecision Hook
 * 
 * Logic Sequence:
 * 1. Goal Reached (Manual Mode) -> 'pending' (Wait for user decision)
 * 2. User Chooses -> 'continuing' OR 'changing'
 * 
 * Key Difference from Auto-Cycle:
 * In Manual Mode, the user MUST make a choice. There is no countdown, no auto-advance,
 * and no "cancel". The prompt persists until an action is taken.
 * The timer continues running during the decision phase to account for the time spent thinking.
 */

import { useState, useCallback } from 'react';
import { Theme, isThemeCompleted } from '../types/theme.types';

export type DecisionPhase = 'idle' | 'pending' | 'continuing' | 'changing';

export interface ManualCycleDecisionState {
  phase: DecisionPhase;
  themeIsComplete: boolean;
  goalReachedAt: string | null;
  nextSubjectName: string | null;
}

interface UseManualCycleDecisionProps {
  isAutoCycle: boolean;
  activeTheme: Theme | null;
  nextSubjectName: string | null;
  onContinue: () => void;
  onChangeSubject: () => void;
}

interface UseManualCycleDecisionReturn {
  decisionState: ManualCycleDecisionState;
  triggerDecision: () => void; // Called by parent when goal is reached
  handleContinue: () => void;
  handleChangeSubject: () => void;
}

export const useManualCycleDecision = ({
  isAutoCycle,
  activeTheme,
  nextSubjectName,
  onContinue,
  onChangeSubject
}: UseManualCycleDecisionProps): UseManualCycleDecisionReturn => {
  const [state, setState] = useState<ManualCycleDecisionState>({
    phase: 'idle',
    themeIsComplete: false,
    goalReachedAt: null,
    nextSubjectName: null
  });

  // Trigger the decision flow (Step 1)
  const triggerDecision = useCallback(() => {
    // Only activate in Manual Mode
    if (isAutoCycle) return;

    const isComplete = activeTheme ? isThemeCompleted(activeTheme) : false;
    
    setState({
      phase: 'pending',
      themeIsComplete: isComplete,
      goalReachedAt: new Date().toISOString(),
      nextSubjectName: nextSubjectName
    });
  }, [isAutoCycle, activeTheme, nextSubjectName]);

  // Handle "Continue" Choice (Step 2a)
  const handleContinue = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'continuing' }));
    
    // Execute parent logic
    onContinue();
    
    // Reset to idle after logic resolves
    // In a real async scenario, we might wait for a promise, but for now we assume sync or fire-and-forget
    setState(prev => ({ ...prev, phase: 'idle' }));
  }, [onContinue]);

  // Handle "Change Subject" Choice (Step 2b)
  const handleChangeSubject = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'changing' }));
    
    // Execute parent logic (which should stop the timer)
    onChangeSubject();
    
    // Reset to idle
    setState(prev => ({ ...prev, phase: 'idle' }));
  }, [onChangeSubject]);

  return {
    decisionState: state,
    triggerDecision,
    handleContinue,
    handleChangeSubject
  };
};
