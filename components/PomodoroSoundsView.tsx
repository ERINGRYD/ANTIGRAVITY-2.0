
import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { Tab } from '../types';
import { useApp } from '../contexts/AppContext';
import { audioService, AmbientSoundType, AlertSoundType } from '../utils/audioService';

interface PomodoroSoundsViewProps {
  onBack: () => void;
}

const PomodoroSoundsView: React.FC<PomodoroSoundsViewProps> = ({ onBack }) => {
  const { isDarkMode, pomodoroSettings, setPomodoroSettings } = useApp();
  const [volume, setVolume] = useState(pomodoroSettings.volume);
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientSoundType>(pomodoroSettings.ambientSound as AmbientSoundType || 'none');
  const [selectedAlert, setSelectedAlert] = useState<AlertSoundType>(pomodoroSettings.alertSound as AlertSoundType || 'sino');
  const [selectedShortBreakSound, setSelectedShortBreakSound] = useState<AlertSoundType>(pomodoroSettings.shortBreakEndSound as AlertSoundType || 'beep');
  const [selectedLongBreakSound, setSelectedLongBreakSound] = useState<AlertSoundType>(pomodoroSettings.longBreakEndSound as AlertSoundType || 'harpa');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab] = useState<Tab>(Tab.CICLO);

  useEffect(() => {
    audioService.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (isPlaying && selectedAmbient !== 'none') {
      audioService.playAmbient(selectedAmbient);
    } else {
      audioService.stopAmbient();
    }
    return () => {
      audioService.stopAmbient();
    };
  }, [isPlaying, selectedAmbient]);

  const handleSave = () => {
    setPomodoroSettings({
      ...pomodoroSettings,
      volume,
      ambientSound: selectedAmbient,
      alertSound: selectedAlert,
      shortBreakEndSound: selectedShortBreakSound,
      longBreakEndSound: selectedLongBreakSound
    });
    audioService.stopAmbient();
    onBack();
  };

  const playAlertSound = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioService.playAlert(id as AlertSoundType);
  };

  const ambientSounds: { id: AmbientSoundType; title: string; desc: string; icon: string; color: string }[] = [
    { id: 'chuva', title: 'Chuva Suave', desc: 'Ideal para foco profundo', icon: 'grain', color: 'blue' },
    { id: 'cafeteria', title: 'Cafeteria', desc: 'Ruído branco social', icon: 'coffee', color: 'slate' },
    { id: 'lofi', title: 'Lo-fi Beats', desc: 'Ritmo constante', icon: 'headset', color: 'slate' },
    { id: 'ondas', title: 'Ondas', desc: 'Calma litorânea', icon: 'waves', color: 'slate' },
  ];

  const alerts: { id: AlertSoundType; title: string; icon: string; color: string }[] = [
    { id: 'sino', title: 'Sino Clássico', icon: 'notifications', color: 'text-amber-500' },
    { id: 'beep', title: 'Beep Digital', icon: 'memory', color: 'text-cyan-500' },
    { id: 'harpa', title: 'Harpa Zen', icon: 'music_note', color: 'text-purple-500' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[70] flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-12 h-12 flex items-center justify-center -ml-3 rounded-full transition-colors active:scale-95">
              <span className="material-icons-round">arrow_back_ios_new</span>
            </button>
            <h1 className="text-sm md:text-lg font-bold leading-tight text-slate-900 dark:text-white">Sons e Alertas</h1>
          </div>
          <button className="text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors">
            <span className="material-icons-round text-2xl">settings</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-6 md:py-10 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Volume Geral */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="material-icons-round text-blue-500">volume_up</span>
              </div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Volume Geral</span>
            </div>
            <span className="text-lg md:text-xl font-black text-blue-500 tabular-nums">{volume}%</span>
          </div>
          <input 
            className="w-full h-2 bg-blue-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            max="100" min="0" type="range" value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
          />
        </section>

        {/* Sons Ambiente */}
        <section className="w-full">
          <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Sons Ambiente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {ambientSounds.map((sound) => {
              const isSelected = selectedAmbient === sound.id;
              return (
                <div 
                  key={sound.id}
                  onClick={() => setSelectedAmbient(sound.id)}
                  className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] md:min-h-[160px] relative group hover:shadow-md ${
                    isSelected ? 'border-blue-500 shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <span className={`material-icons-round ${isSelected ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>{sound.icon}</span>
                    </div>
                    {isSelected && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                        className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-900/40 flex items-center justify-center text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="material-icons-round text-lg">{isPlaying ? 'pause' : 'play_arrow'}</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs md:text-sm font-bold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-white'}`}>{sound.title}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight mt-1">{sound.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <span className="material-icons-round text-blue-500 text-lg">check_circle</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Alertas de Conclusão */}
        <section className="max-w-2xl mx-auto w-full flex flex-col gap-8">
          <div>
            <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Fim do Foco (Início da Pausa)</h2>
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => (
                <label 
                  key={`focus-${alert.id}`}
                  className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between cursor-pointer group hover:shadow-sm ${
                    selectedAlert === alert.id ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <span className={`material-icons-round ${alert.color}`}>{alert.icon}</span>
                    </div>
                    <span className={`text-sm md:text-base font-bold ${selectedAlert === alert.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => playAlertSound(alert.id, e)}
                      className="text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors p-2"
                    >
                      <span className="material-icons-round text-xl">play_circle</span>
                    </button>
                    <input 
                      checked={selectedAlert === alert.id}
                      onChange={() => setSelectedAlert(alert.id)}
                      className="w-5 h-5 text-blue-500 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer" 
                      name="alert-focus" type="radio"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Fim da Pausa Curta (Volta ao Foco)</h2>
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => (
                <label 
                  key={`short-${alert.id}`}
                  className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between cursor-pointer group hover:shadow-sm ${
                    selectedShortBreakSound === alert.id ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <span className={`material-icons-round ${alert.color}`}>{alert.icon}</span>
                    </div>
                    <span className={`text-sm md:text-base font-bold ${selectedShortBreakSound === alert.id ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => playAlertSound(alert.id, e)}
                      className="text-slate-300 dark:text-slate-600 hover:text-cyan-500 transition-colors p-2"
                    >
                      <span className="material-icons-round text-xl">play_circle</span>
                    </button>
                    <input 
                      checked={selectedShortBreakSound === alert.id}
                      onChange={() => setSelectedShortBreakSound(alert.id)}
                      className="w-5 h-5 text-cyan-500 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer" 
                      name="alert-short" type="radio"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">Fim da Pausa Longa (Volta ao Foco)</h2>
            <div className="flex flex-col gap-3">
              {alerts.map((alert) => (
                <label 
                  key={`long-${alert.id}`}
                  className={`bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center justify-between cursor-pointer group hover:shadow-sm ${
                    selectedLongBreakSound === alert.id ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <span className={`material-icons-round ${alert.color}`}>{alert.icon}</span>
                    </div>
                    <span className={`text-sm md:text-base font-bold ${selectedLongBreakSound === alert.id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => playAlertSound(alert.id, e)}
                      className="text-slate-300 dark:text-slate-600 hover:text-purple-500 transition-colors p-2"
                    >
                      <span className="material-icons-round text-xl">play_circle</span>
                    </button>
                    <input 
                      checked={selectedLongBreakSound === alert.id}
                      onChange={() => setSelectedLongBreakSound(alert.id)}
                      className="w-5 h-5 text-purple-500 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer" 
                      name="alert-long" type="radio"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 max-w-2xl mx-auto w-full">
          <button 
            onClick={handleSave}
            className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black text-sm md:text-base uppercase tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 hover:brightness-110"
          >
            Confirmar Escolhas
            <span className="material-icons-round text-lg md:text-xl">check_circle</span>
          </button>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={() => {}} />
    </div>
  );
};

export default PomodoroSoundsView;
