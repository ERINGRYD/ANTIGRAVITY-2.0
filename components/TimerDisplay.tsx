/**
 * Timer Display Component
 * 
 * Design Decisions:
 * 1. Minimalist Display: Focuses on the essential numbers (elapsed time, progress).
 * 2. Visual Feedback: Uses color changes (green for goal reached) to indicate status.
 * 3. Pure Component: No internal state, relies entirely on props for rendering.
 */

import React from 'react';
import { StudyTimerState } from '../hooks/useStudyTimer';

interface TimerDisplayProps {
  timerState: StudyTimerState;
  subjectName: string;
  themeName: string;
  cycleGoalTime: number; // in minutes
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  subjectName,
  themeName,
  cycleGoalTime
}) => {
  const { elapsedSeconds, cycleTimeSeconds, themeTimeSeconds, isGoalReached, excessSeconds } = timerState;

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format minutes for progress display
  const currentCycleMinutes = Math.floor(cycleTimeSeconds / 60);
  const excessMinutes = Math.floor(excessSeconds / 60);
  const totalThemeMinutes = Math.floor(themeTimeSeconds / 60);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-md mx-auto space-y-6">
      
      {/* Subject & Theme Info */}
      <div className="text-center space-y-1">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {subjectName}
        </h2>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {themeName}
        </h3>
      </div>

      {/* Main Timer Display */}
      <div className="relative flex items-center justify-center">
        <div className={`text-7xl font-mono font-bold tracking-tighter tabular-nums transition-colors duration-500 ${isGoalReached ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Cycle Progress Status */}
      <div className="w-full space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Progresso do Ciclo</span>
          <span>{currentCycleMinutes} / {cycleGoalTime} min</span>
        </div>
        
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isGoalReached ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, (currentCycleMinutes / cycleGoalTime) * 100)}%` }}
          />
        </div>

        {/* Goal Status Message */}
        <div className="text-center h-6">
          {isGoalReached ? (
            <span className="text-xs font-bold text-emerald-500 animate-pulse">
              Meta do ciclo atingida! {excessMinutes > 0 && `(+${excessMinutes} min)`}
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              Faltam {Math.max(0, cycleGoalTime - currentCycleMinutes)} min para a meta
            </span>
          )}
        </div>
      </div>

      {/* Theme Total Time */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Tempo Total do Tema
        </span>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {Math.floor(totalThemeMinutes / 60)}h {totalThemeMinutes % 60}m
        </span>
      </div>

    </div>
  );
};

export default TimerDisplay;
