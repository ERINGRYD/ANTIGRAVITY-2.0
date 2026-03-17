
import React, { useState } from 'react';
import BottomNav from './BottomNav';
import { Tab, PomodoroSettings } from '../types';
import { useApp } from '../contexts/AppContext';

interface PomodoroSettingsViewProps {
  currentSettings: PomodoroSettings;
  onSave: (settings: PomodoroSettings) => void;
  onBack: () => void;
}

const PomodoroSettingsView: React.FC<PomodoroSettingsViewProps> = ({ currentSettings, onSave, onBack }) => {
  const { isDarkMode } = useApp();
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(currentSettings);
  const [activeTab] = useState<Tab>(Tab.CICLO);

  const handleSaveClick = () => {
    onSave(localSettings);
  };

  const updateSetting = <K extends keyof PomodoroSettings>(key: K, value: PomodoroSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[70] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors flex items-center justify-center w-12 h-12 -ml-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full active:scale-95">
              <span className="material-icons-round text-xl">arrow_back_ios_new</span>
            </button>
          </div>
          <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white text-center flex-1">Ajustar Pomodoro</h1>
          <div className="w-10 flex justify-end">
            <span className="material-icons-round text-slate-300 dark:text-slate-600">settings</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 md:py-10 max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {/* Grid de Tempos Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Tempo de Foco */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="material-icons-round text-blue-500 text-xl">timer</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tempo de Foco</h3>
              </div>
              <span className="text-2xl md:text-3xl font-black text-blue-500 tracking-tight">{localSettings.focusTime}<span className="text-xs md:text-sm ml-1 font-bold text-blue-400">min</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => updateSetting('focusTime', Math.max(5, localSettings.focusTime - 5))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">remove</span>
              </button>
              <div className="flex-1">
                <input className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" max="60" min="5" step="5" type="range" value={localSettings.focusTime} onChange={(e) => updateSetting('focusTime', parseInt(e.target.value))}/>
              </div>
              <button onClick={() => updateSetting('focusTime', Math.min(60, localSettings.focusTime + 5))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">add</span>
              </button>
            </div>
          </div>

          {/* Pausa Curta */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                  <span className="material-icons-round text-cyan-500 text-xl">coffee</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pausa Curta</h3>
              </div>
              <span className="text-2xl md:text-3xl font-black text-cyan-500 tracking-tight">{localSettings.shortBreak}<span className="text-xs md:text-sm ml-1 font-bold text-cyan-400">min</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => updateSetting('shortBreak', Math.max(1, localSettings.shortBreak - 1))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">remove</span>
              </button>
              <div className="flex-1">
                <input className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" max="15" min="1" type="range" value={localSettings.shortBreak} onChange={(e) => updateSetting('shortBreak', parseInt(e.target.value))}/>
              </div>
              <button onClick={() => updateSetting('shortBreak', Math.min(15, localSettings.shortBreak + 1))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">add</span>
              </button>
            </div>
          </div>

          {/* Pausa Longa (Púrpura) */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <span className="material-icons-round text-purple-500 text-xl">spa</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pausa Longa</h3>
              </div>
              <span className="text-2xl md:text-3xl font-black text-purple-500 tracking-tight">{localSettings.longBreak}<span className="text-xs md:text-sm ml-1 font-bold text-purple-400">min</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => updateSetting('longBreak', Math.max(5, localSettings.longBreak - 5))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">remove</span>
              </button>
              <div className="flex-1">
                <input className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" max="45" min="5" step="5" type="range" value={localSettings.longBreak} onChange={(e) => updateSetting('longBreak', parseInt(e.target.value))}/>
              </div>
              <button onClick={() => updateSetting('longBreak', Math.min(45, localSettings.longBreak + 5))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all shadow-sm">
                <span className="material-icons-round">add</span>
              </button>
            </div>
          </div>

          {/* Ciclos até Pausa Longa (PASSO 3) */}
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <span className="material-icons-round text-orange-500 text-xl">auto_mode</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ciclos p/ Pausa Longa</h3>
              </div>
              <span className="text-2xl md:text-3xl font-black text-orange-500 tracking-tight">{localSettings.pomodorosUntilLongBreak}</span>
            </div>
            
            <div className="space-y-4">
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={localSettings.pomodorosUntilLongBreak}
                onChange={(e) => updateSetting('pomodorosUntilLongBreak', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter text-center">
                Quantos focos antes do descanso prolongado
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Transições Automáticas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 mt-2">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Transições Automáticas</h3>
          
          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                <span className="material-icons-round text-cyan-600 dark:text-cyan-400 text-lg">coffee</span>
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Auto-iniciar Pausas</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">A pausa começa logo após o foco</p>
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={localSettings.autoStartBreaks}
                onChange={(e) => updateSetting('autoStartBreaks', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white dark:bg-slate-300 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
            </div>
          </label>
          
          <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="material-icons-round text-blue-600 dark:text-blue-400 text-lg">play_circle</span>
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Auto-iniciar Foco</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">O foco começa logo após a pausa</p>
              </div>
            </div>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={localSettings.autoStartPomodoros}
                onChange={(e) => updateSetting('autoStartPomodoros', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute left-1 top-1 bg-white dark:bg-slate-300 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 shadow-sm"></div>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col gap-5 max-w-md mx-auto w-full">
          <button 
            onClick={handleSaveClick}
            className="w-full bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 active:scale-[0.98] hover:brightness-110 transition-all"
          >
            Confirmar Alterações
          </button>
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
            <span className="material-icons-round text-blue-400 dark:text-blue-500 text-lg">info</span>
            <p className="text-[10px] text-blue-600/70 dark:text-blue-400 font-bold leading-relaxed">
              Configurações de ciclo ajudam a manter o estado de fluxo e garantem o descanso necessário para a retenção.
            </p>
          </div>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={() => {}} />
    </div>
  );
};

export default PomodoroSettingsView;
