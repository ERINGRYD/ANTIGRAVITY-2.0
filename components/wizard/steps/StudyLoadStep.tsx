import React, { useState } from 'react';
import { WizardState } from '../../../types/wizard.types';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const presetHours = [
  { value: 10, label: '10h/semana', desc: '~1.5h por dia' },
  { value: 20, label: '20h/semana', desc: '~3h por dia' },
  { value: 30, label: '30h/semana', desc: '~4.5h por dia' },
  { value: 40, label: '40h/semana', desc: '~6h por dia' },
];

const StudyLoadStep: React.FC<StepProps> = ({ state, updateState }) => {
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetSelect = (hours: number) => {
    setIsCustom(false);
    updateState({ weeklyHours: hours });
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      updateState({ weeklyHours: val });
    } else {
      updateState({ weeklyHours: null });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Qual sua carga horária?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Quantas horas por semana você pretende dedicar aos estudos?</p>
      </section>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presetHours.map((preset) => {
            const isSelected = !isCustom && state.weeklyHours === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
                }`}
              >
                <span className={`text-lg font-bold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                  {preset.label}
                </span>
                <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}>
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-950 px-4 text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Ou defina manualmente
            </span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${
          isCustom 
            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/10' 
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
        }`}>
          <button
            onClick={() => {
              setIsCustom(true);
              if (!isCustom) updateState({ weeklyHours: null });
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
              isCustom 
                ? 'border-blue-600 bg-blue-600 shadow-md shadow-blue-600/20' 
                : 'border-slate-300 dark:border-slate-700'
            }`}
          >
            {isCustom && <div className="w-2 h-2 rounded-full bg-white" />}
          </button>
          
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="168"
                disabled={!isCustom}
                value={isCustom ? (state.weeklyHours || '') : ''}
                onChange={handleCustomChange}
                placeholder="Ex: 25"
                className={`w-24 px-4 py-2 rounded-xl border font-bold text-base focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                  isCustom 
                    ? 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed'
                }`}
              />
            </div>
            <span className={`text-sm font-bold ${isCustom ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              horas/semana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyLoadStep;
