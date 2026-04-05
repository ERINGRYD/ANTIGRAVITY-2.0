import React from 'react';
import { WizardState } from '../../../types/wizard.types';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const TimerSetupStep: React.FC<StepProps> = ({ state, updateState }) => {
  const handleChange = (field: keyof WizardState['timerSettings'], value: number) => {
    updateState({
      timerSettings: {
        ...state.timerSettings,
        [field]: value
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Método Pomodoro</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure os tempos do seu ciclo de estudos para manter o foco.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Focus Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-xl">center_focus_strong</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tempo de Foco</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Duração do estudo</p>
              </div>
            </div>
            <span className="text-xl font-black text-blue-600">{state.timerSettings.focusTime}m</span>
          </div>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={state.timerSettings.focusTime}
            onChange={(e) => handleChange('focusTime', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Short Break */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined text-xl">coffee</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Pausa Curta</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Descanso rápido</p>
              </div>
            </div>
            <span className="text-xl font-black text-emerald-600">{state.timerSettings.shortBreak}m</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={state.timerSettings.shortBreak}
            onChange={(e) => handleChange('shortBreak', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Long Break */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined text-xl">self_improvement</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Pausa Longa</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Descanso maior</p>
              </div>
            </div>
            <span className="text-xl font-black text-indigo-600">{state.timerSettings.longBreak}m</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={state.timerSettings.longBreak}
            onChange={(e) => handleChange('longBreak', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                <span className="material-symbols-outlined text-xl">repeat</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Ciclos</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Até a pausa longa</p>
              </div>
            </div>
            <span className="text-xl font-black text-purple-600">{state.timerSettings.sessionsUntilLongBreak}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={state.timerSettings.sessionsUntilLongBreak}
            onChange={(e) => handleChange('sessionsUntilLongBreak', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default TimerSetupStep;
