import React, { useMemo } from 'react';
import { Subject } from '../types';

interface CycleProgressBarProps {
  subjects: Subject[];
  onReset: () => void;
}

export function calculateCycleProgress(subjects: Subject[]) {
  if (subjects.length === 0) return { completed: 0, total: 0, percentage: 0 };
  
  // A subject is considered "completed" for the cycle rotation if its studied time meets or exceeds the goal
  const completed = subjects.filter(s => s.studiedMinutes >= s.totalMinutes).length;
  const total = subjects.length;
  const percentage = Math.round((completed / total) * 100);
  
  return { completed, total, percentage };
}

const CycleProgressBar: React.FC<CycleProgressBarProps> = ({ subjects, onReset }) => {
  const { completed, total, percentage } = useMemo(() => calculateCycleProgress(subjects), [subjects]);
  const isComplete = percentage === 100 && total > 0;

  if (total === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in duration-500">
      {/* Labels */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {isComplete ? 'Ciclo Finalizado' : 'Ciclo Atual'}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isComplete ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
          {isComplete ? '100%' : `${completed} de ${total} matérias`}
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
        {/* Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Celebration Pulse Effect (Only when complete) */}
        {isComplete && (
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        )}
      </div>

      {/* Completion Message & Reset Action */}
      {isComplete && (
        <div className="mt-2 flex flex-col items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="material-icons-round text-xl animate-bounce">celebration</span>
            <span className="text-sm font-bold">Ciclo completo! Parabéns pela volta.</span>
          </div>
          
          <button
            onClick={onReset}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-icons-round text-sm">restart_alt</span>
            Reiniciar Ciclo
          </button>
        </div>
      )}
    </div>
  );
};

export default CycleProgressBar;
