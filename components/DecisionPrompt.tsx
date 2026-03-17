/**
 * Decision Prompt Component
 * 
 * Design Decisions:
 * 1. Modal Overlay: Uses a backdrop to focus attention, but keeps the timer visible behind it.
 * 2. Mandatory Choice: No close button. The user must explicitly choose to continue or change.
 * 3. Clear Context: Shows theme name and completion status to inform the decision.
 * 4. Primary/Secondary Hierarchy: "Continue" is often the safer default, but "Change" is the cycle goal.
 *    We style them distinctly to guide the user.
 */

import React from 'react';
import { ManualCycleDecisionState } from '../hooks/useManualCycleDecision';

interface DecisionPromptProps {
  decisionState: ManualCycleDecisionState;
  activeThemeName: string;
  nextSubjectName: string | null;
  onContinue: () => void;
  onChangeSubject: () => void;
}

const DecisionPrompt: React.FC<DecisionPromptProps> = ({
  decisionState,
  activeThemeName,
  nextSubjectName,
  onContinue,
  onChangeSubject
}) => {
  const { phase, themeIsComplete } = decisionState;

  if (phase !== 'pending') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-300 flex flex-col gap-6">
        
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
            themeIsComplete 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 shadow-emerald-500/20' 
              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 shadow-amber-500/20'
          }`}>
            <span className="material-icons-round text-3xl">
              {themeIsComplete ? 'check_circle' : 'warning'}
            </span>
          </div>
          
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {themeIsComplete ? 'Tema concluído e meta atingida!' : 'Meta do ciclo atingida'}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {themeIsComplete 
                ? 'Você completou o tema e atingiu a meta de tempo.' 
                : `O tema "${activeThemeName}" ainda está incompleto.`}
            </p>
          </div>
        </div>

        {/* Informational Subtext */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed text-center border border-slate-100 dark:border-slate-800">
          {themeIsComplete 
            ? 'Deseja continuar estudando esta matéria ou avançar para a próxima?' 
            : 'Você pode continuar estudando este tema ou avançar para a próxima matéria. O progresso do tema será preservado.'}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={onContinue}
            className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shadow-sm"
          >
            {themeIsComplete ? 'Continuar nesta matéria' : 'Continuar no tema atual'}
          </button>
          
          <button 
            onClick={onChangeSubject}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>
              {nextSubjectName 
                ? (themeIsComplete ? `Avançar para ${nextSubjectName}` : `Mudar para ${nextSubjectName}`)
                : (themeIsComplete ? 'Avançar de matéria' : 'Mudar de matéria')
              }
            </span>
            <span className="material-icons-round text-lg">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default DecisionPrompt;
