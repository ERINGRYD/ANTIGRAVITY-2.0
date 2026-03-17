
import React, { useState, useEffect } from 'react';
import { Tab } from '../types';
import BottomNav from './BottomNav';

interface BattleSelectionViewProps {
  onBack: () => void;
  onStartBattle: (config: any) => void;
  onSelectIndividually: () => void;
  initialMode?: 'triagem' | 'defesa' | 'revisao';
  onModeChange?: (mode: 'triagem' | 'defesa' | 'revisao') => void;
}

const BattleSelectionView: React.FC<BattleSelectionViewProps> = ({ 
  onBack, 
  onStartBattle, 
  onSelectIndividually,
  initialMode = 'revisao',
  onModeChange
}) => {
  const [selectedMode, setSelectedMode] = useState<'triagem' | 'defesa' | 'revisao'>(initialMode);
  const [mixSubjects, setMixSubjects] = useState(true);
  const [questionLimit, setQuestionLimit] = useState(20);
  const [timeModel, setTimeModel] = useState<'no_limit' | '1m' | '2m' | '3m'>('no_limit');
  const [roomType, setRoomType] = useState<'arena' | 'coliseu' | 'torre'>('arena');

  useEffect(() => {
    onModeChange?.(selectedMode);
  }, [selectedMode, onModeChange]);

  const getButtonConfig = () => {
    switch (selectedMode) {
      case 'triagem': return { label: 'Iniciar Reconhecimento', icon: 'filter_alt' };
      case 'defesa': return { label: 'Iniciar Crítico', icon: 'shield' };
      default: return { label: 'Iniciar Revisão', icon: 'history_edu' };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-[#F8FAFC] w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
        
        {/* Header Estilo HUD */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-5 py-4 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700">
                <span className="material-symbols-outlined text-xl">swords</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-black leading-tight truncate text-slate-900">Seleção de Batalha</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Painel de Controle HUD</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <HeaderActionIcon icon="add" primary />
              <HeaderActionIcon icon="history" className="hidden sm:flex" />
              <HeaderActionIcon icon="insights" className="hidden sm:flex" />
              <HeaderActionIcon icon="military_tech" strong />
              <div className="ml-1 relative">
                <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-200">
                  <img alt="User Avatar" className="w-full h-full object-cover" src="/default-avatar.svg"/>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <main className="px-6 py-8 flex flex-col gap-8 w-full max-w-xl mx-auto">
            {/* Vital Stats Section */}
            <section className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons-round text-red-500 text-sm">favorite</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Energia Vital</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">85</span>
                  <span className="text-[11px] font-bold text-slate-300">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden border border-slate-50">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-icons-round text-emerald-500 text-sm">gps_fixed</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Precisão</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">92%</span>
                  <span className="text-[11px] font-black text-emerald-500">+2%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden border border-slate-50">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                </div>
              </div>
            </section>

            {/* Operation Modes Section */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-1">Modos de Operação</h2>
              
              <div className="grid grid-cols-1 gap-3">
                <ModeOption 
                  id="triagem" 
                  label="Reconhecimento" 
                  desc="Organize novas questões" 
                  icon="filter_alt" 
                  color="bg-blue-50 text-blue-500"
                  active={selectedMode === 'triagem'}
                  onClick={() => setSelectedMode('triagem')}
                />
                
                <ModeOption 
                  id="defesa" 
                  label="Crítico" 
                  desc="Proteja seu território (Erros)" 
                  icon="shield" 
                  color="bg-emerald-50 text-emerald-500"
                  active={selectedMode === 'defesa'}
                  onClick={() => setSelectedMode('defesa')}
                />

                <ModeOption 
                  id="revisao" 
                  label="Revisar" 
                  desc="Consolidar conhecimento" 
                  icon="history_edu" 
                  color="bg-amber-50 text-amber-500"
                  active={selectedMode === 'revisao'}
                  onClick={() => setSelectedMode('revisao')}
                />
              </div>

              {/* Subject Selection Settings - Always visible regardless of mode */}
              <div className="bg-white/60 backdrop-blur-sm rounded-[32px] p-5 border border-slate-200/50 animate-in fade-in slide-in-from-top-4 duration-500 shadow-inner mt-2">
                <div className="flex flex-col gap-5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Misturar todas as matérias</span>
                    <div className="relative inline-block w-11 h-6 align-middle select-none transition duration-200 ease-in">
                      <input 
                        type="checkbox" 
                        checked={mixSubjects}
                        onChange={() => setMixSubjects(!mixSubjects)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors shadow-inner"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                  </label>
                  
                  {!mixSubjects && (
                    <>
                      <div className="h-px bg-slate-200/60"></div>
                      <button 
                        onClick={onSelectIndividually}
                        className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-blue-500 hover:opacity-70 transition-all active:translate-x-1 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <span>Selecionar Individualmente</span>
                        <span className="material-icons-round text-sm">chevron_right</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Room Types Section */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-1">Tipos de Salas</h2>
              <div className="grid grid-cols-3 gap-3">
                <RoomOption 
                  id="arena"
                  label="Arena"
                  icon="swords"
                  active={roomType === 'arena'}
                  onClick={() => setRoomType('arena')}
                />
                <RoomOption 
                  id="coliseu"
                  label="Coliseu"
                  icon="account_balance"
                  active={roomType === 'coliseu'}
                  onClick={() => setRoomType('coliseu')}
                />
                <RoomOption 
                  id="torre"
                  label="Torre"
                  icon="castle"
                  active={roomType === 'torre'}
                  onClick={() => setRoomType('torre')}
                />
              </div>
            </section>

            {/* Time Models Section */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] px-1">Modelos de Tempo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <TimeOption 
                  id="no_limit"
                  label="Livre"
                  icon="all_inclusive"
                  active={timeModel === 'no_limit'}
                  onClick={() => setTimeModel('no_limit')}
                />
                <TimeOption 
                  id="1m"
                  label="1 min/q"
                  icon="timer"
                  active={timeModel === '1m'}
                  onClick={() => setTimeModel('1m')}
                />
                <TimeOption 
                  id="2m"
                  label="2 min/q"
                  icon="timer"
                  active={timeModel === '2m'}
                  onClick={() => setTimeModel('2m')}
                />
                <TimeOption 
                  id="3m"
                  label="3 min/q"
                  icon="timer"
                  active={timeModel === '3m'}
                  onClick={() => setTimeModel('3m')}
                />
              </div>
            </section>

            {/* Question Limit Section */}
            <section>
              <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Limite de Questões</span>
                  <span className="text-base font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">{questionLimit} questões</span>
                </div>
                <div className="px-1">
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="1"
                    value={questionLimit}
                    onChange={(e) => setQuestionLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-all"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Mín: 5</span>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">Máx: 50</span>
                </div>
              </div>
            </section>

            {/* Action Button */}
            <div className="pt-2">
              <button 
                onClick={() => onStartBattle({ mode: selectedMode, limit: questionLimit, mix: mixSubjects, timeModel, roomType })}
                className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-sm md:text-base uppercase tracking-[0.15em] shadow-[0_15px_35px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <span className="material-icons-round text-[24px] transition-transform group-hover:rotate-12">{buttonConfig.icon}</span>
                {buttonConfig.label}
              </button>
            </div>
          </main>
        </div>

        {/* Placeholder for Bottom Nav on mobile, or just padding */}
        <div className="md:hidden h-20 shrink-0"></div>
      </div>

      <div className="md:hidden">
        <BottomNav activeTab={Tab.BATALHA} setActiveTab={() => {}} />
      </div>
    </div>
  );
};

const HeaderActionIcon: React.FC<{ icon: string, primary?: boolean, strong?: boolean, className?: string }> = ({ icon, primary, strong, className = "" }) => (
  <button className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-white border border-slate-100 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-90 ${primary ? 'ring-2 ring-blue-500/10 border-blue-100' : ''} ${className}`}>
    <span className={`material-icons-round text-lg md:text-xl ${strong ? 'text-slate-900' : 'text-blue-500'} ${primary ? 'font-black' : ''}`}>{icon}</span>
  </button>
);

const ModeOption: React.FC<{ 
  id: string, 
  label: string, 
  desc: string, 
  icon: string, 
  color: string,
  active: boolean,
  onClick: () => void 
}> = ({ label, desc, icon, color, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 rounded-[28px] border-2 transition-all cursor-pointer flex items-center justify-between group ${active ? 'border-blue-500 shadow-lg scale-[1.02]' : 'border-slate-50 hover:border-slate-200 shadow-sm'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${active ? 'bg-blue-600 text-white shadow-blue-500/20' : color} group-hover:scale-110`}>
        <span className="material-icons-round text-2xl">{icon}</span>
      </div>
      <div>
        <h3 className={`text-sm md:text-base font-black transition-colors ${active ? 'text-slate-900' : 'text-slate-600'}`}>{label}</h3>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium">{desc}</p>
      </div>
    </div>
    <div className="flex items-center">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-blue-500' : 'border-slate-200'}`}>
        <div className={`w-3 h-3 rounded-full bg-blue-500 transition-all ${active ? 'scale-100' : 'scale-0'}`}></div>
      </div>
    </div>
  </div>
);

const RoomOption: React.FC<{
  id: string,
  label: string,
  icon: string,
  active: boolean,
  onClick: () => void
}> = ({ label, icon, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${active ? 'border-blue-500 shadow-md bg-blue-50/30' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 text-slate-500'} group-hover:scale-110`}>
      <span className={icon === 'swords' ? 'material-symbols-outlined text-xl font-variation-fill-1' : 'material-icons-round text-xl'}>{icon}</span>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span>
  </div>
);

const TimeOption: React.FC<{
  id: string,
  label: string,
  icon: string,
  active: boolean,
  onClick: () => void
}> = ({ label, icon, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${active ? 'border-blue-500 shadow-md bg-blue-50/30' : 'border-slate-100 hover:border-slate-200 shadow-sm'}`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 text-slate-500'} group-hover:scale-110`}>
      <span className="material-icons-round text-sm">{icon}</span>
    </div>
    <span className={`text-[10px] font-black uppercase tracking-wider text-center ${active ? 'text-blue-700' : 'text-slate-500'}`}>{label}</span>
  </div>
);

export default BattleSelectionView;
