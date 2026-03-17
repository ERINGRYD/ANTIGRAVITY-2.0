/**
 * Transition Overlay Component
 * 
 * Design Decisions:
 * 1. Non-Blocking Overlay: Appears above the timer but doesn't obscure critical controls.
 * 2. Clear Status Indication: Uses icons and distinct colors (amber for warning, emerald for success) to communicate state.
 * 3. Actionable: Provides a clear "Cancel" or "Wait" button to interrupt the flow.
 */

import React from 'react';
import { AutoCycleTransitionState } from '../hooks/useAutoCycleTransition';

interface TransitionOverlayProps {
  transitionState: AutoCycleTransitionState;
  activeThemeName: string;
  onCancel: () => void;
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  transitionState,
  activeThemeName,
  onCancel
}) => {
  const { phase, countdownSeconds, themeIsComplete, nextSubjectName } = transitionState;

  if (phase === 'idle') return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4 animate-in slide-in-from-top-2 duration-300">
      <div className={`
        rounded-2xl shadow-lg border backdrop-blur-md p-4 flex flex-col items-center gap-3 text-center transition-colors duration-300
        ${phase === 'waiting-pomodoro' ? 'bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700' : ''}
        ${phase === 'countdown' && !themeIsComplete ? 'bg-amber-50/90 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700' : ''}
        ${phase === 'countdown' && themeIsComplete ? 'bg-emerald-50/90 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700' : ''}
        ${phase === 'advancing' ? 'bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700' : ''}
      `}>
        
        {/* Phase: Waiting for Pomodoro */}
        {phase === 'waiting-pomodoro' && (
          <>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-500 dark:text-blue-300 animate-pulse">
              <span className="material-icons-round text-xl">hourglass_empty</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Meta do ciclo atingida</h3>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">
                Aguardando o Pomodoro finalizar...
              </p>
            </div>
          </>
        )}

        {/* Phase: Countdown (Incomplete Theme) */}
        {phase === 'countdown' && !themeIsComplete && (
          <>
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-500 dark:text-amber-300">
              <span className="material-icons-round text-xl">warning</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">Tema incompleto</h3>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1">
                O tema <span className="font-bold">"{activeThemeName}"</span> será retomado na próxima rodada.
              </p>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2 uppercase tracking-wide">
                Avançando {nextSubjectName ? `para ${nextSubjectName}` : 'para a próxima matéria'} em {countdownSeconds}s
              </p>
            </div>
            <button 
              onClick={onCancel}
              className="mt-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/50 transition-colors"
            >
              Continuar nesta matéria
            </button>
          </>
        )}

        {/* Phase: Countdown (Complete Theme) */}
        {phase === 'countdown' && themeIsComplete && (
          <>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-500 dark:text-emerald-300">
              <span className="material-icons-round text-xl">check_circle</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Tema concluído!</h3>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mt-1">
                Avançando {nextSubjectName ? `para ${nextSubjectName}` : 'para a próxima matéria'}.
              </p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 uppercase tracking-wide">
                Em {countdownSeconds}s...
              </p>
            </div>
            <button 
              onClick={onCancel}
              className="mt-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors"
            >
              Aguardar
            </button>
          </>
        )}

        {/* Phase: Advancing */}
        {phase === 'advancing' && (
          <>
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 animate-spin">
              <span className="material-icons-round text-xl">refresh</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Avançando...</h3>
          </>
        )}

      </div>
    </div>
  );
};

export default TransitionOverlay;
