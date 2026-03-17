
import React, { useState, useMemo } from 'react';
import { Subject, Tab } from '../types';
import BottomNav from './BottomNav';

interface ArenaPrepViewProps {
  selectedSubjects: Subject[];
  mode: 'triagem' | 'defesa' | 'revisao';
  onBack: () => void;
  onEnterArena: (config: any) => void;
}

const ArenaPrepView: React.FC<ArenaPrepViewProps> = ({ selectedSubjects, mode, onBack, onEnterArena }) => {
  const [battleSize, setBattleSize] = useState(15);
  const [pressureTimer, setPressureTimer] = useState(true);
  const [dynamicDifficulty, setDynamicDifficulty] = useState(false);

  const totalAvailableQuestions = useMemo(() => {
    return selectedSubjects.reduce((acc, s) => acc + s.topics.reduce((tAcc, t) => tAcc + t.totalQuestions, 0), 0);
  }, [selectedSubjects]);

  const potentialXP = useMemo(() => {
    let base = battleSize * 50;
    if (mode === 'defesa') base *= 1.2;
    if (mode === 'triagem') base *= 1.1;
    if (pressureTimer) base *= 1.2;
    if (dynamicDifficulty) base *= 1.5;
    return Math.floor(base);
  }, [battleSize, pressureTimer, dynamicDifficulty, mode]);

  const eliteBonus = useMemo(() => {
    let bonus = 1.0;
    if (pressureTimer) bonus += 0.2;
    return bonus.toFixed(1);
  }, [pressureTimer]);

  return (
    <div className="fixed inset-0 z-[220] bg-[#F8FAFC] flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar pb-48">
      {/* Header Estilo Master v1.3 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-icons-round text-slate-900">chevron_left</span>
          </button>
          <h1 className="text-lg font-bold leading-tight flex-1 text-center text-slate-900">Preparar Arena</h1>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
            <img alt="User Avatar" className="w-full h-full object-cover" src="/default-avatar.svg"/>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto w-full flex-1 space-y-8">
        {/* Frentes de Combate Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {selectedSubjects.slice(0, 2).map((s, idx) => (
                <div 
                  key={s.id} 
                  className="w-12 h-12 rounded-xl border-2 border-white flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${s.color}15`, color: s.color, zIndex: 3 - idx }}
                >
                  <span className="material-symbols-outlined text-2xl font-variation-fill-1">{s.icon}</span>
                </div>
              ))}
              {selectedSubjects.length > 2 && (
                <div className="w-12 h-12 rounded-xl border-2 border-white flex items-center justify-center bg-slate-100 text-slate-500 shadow-sm z-0 text-xs font-black">
                  +{selectedSubjects.length - 2}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {selectedSubjects.length} {selectedSubjects.length === 1 ? 'Frente' : 'Frentes'} de Combate
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                • ~{totalAvailableQuestions} Inimigos disponíveis
              </p>
            </div>
          </div>
        </div>

        {/* Tamanho da Batalha Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tamanho da Batalha</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 tabular-nums">{battleSize}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">questões</span>
            </div>
          </div>
          <div className="px-2">
            <input 
              type="range" 
              min="5" 
              max="20" 
              step="5"
              value={battleSize}
              onChange={(e) => setBattleSize(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-all slider-custom"
            />
            <div className="flex justify-between mt-3 px-1">
              {[5, 10, 15, 20].map(val => (
                <span key={val} className={`text-[10px] font-bold transition-colors ${battleSize === val ? 'text-blue-500' : 'text-slate-400'}`}>
                  {val}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Configurações Grid */}
        <div className="flex flex-col gap-3">
          <ToggleOption 
            icon="timer" 
            label="Cronômetro de Pressão" 
            checked={pressureTimer} 
            onChange={() => setPressureTimer(!pressureTimer)} 
          />
          <ToggleOption 
            icon="bolt" 
            label="Dificuldade Dinâmica" 
            checked={dynamicDifficulty} 
            onChange={() => setDynamicDifficulty(!dynamicDifficulty)} 
          />
        </div>

        {/* XP & Bônus de Elite Card */}
        <div className="bg-blue-600/10 border-2 border-blue-600/30 rounded-[24px] p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-icons-round text-7xl text-blue-900">military_tech</span>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">XP Potencial:</span>
              <span className="text-lg font-black text-blue-900 tabular-nums">+{potentialXP.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Bônus de Elite:</span>
              <span className="text-sm font-bold text-blue-500">{eliteBonus}x</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Estático com Botão Entrar na Arena */}
      <div className="fixed bottom-[84px] left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-40 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={() => onEnterArena({ battleSize, pressureTimer, dynamicDifficulty, mode, selectedSubjects })}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-sm tracking-widest uppercase shadow-[0_8px_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] bg-gradient-to-r from-blue-500 to-blue-700"
          >
            <span>Entrar na Arena</span>
            <span className="material-symbols-outlined font-variation-fill-1 text-[24px]">swords</span>
          </button>
        </div>
      </div>

      <BottomNav activeTab={Tab.BATALHA} setActiveTab={() => {}} />

      <style>{`
        .slider-custom::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            background: #3b82f6;
            border: 4px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            transition: transform 0.2s;
        }
        .slider-custom::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

const ToggleOption: React.FC<{ icon: string, label: string, checked: boolean, onChange: () => void }> = ({ icon, label, checked, onChange }) => (
  <div className="bg-slate-100 rounded-[16px] p-4 flex items-center justify-between border border-slate-200">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm">
        <span className="material-icons-round text-lg">{icon}</span>
      </div>
      <span className="text-sm font-bold text-slate-900">{label}</span>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        className="sr-only peer" 
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
  </div>
);

export default ArenaPrepView;
