import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export interface MissionReportData {
  exercises: number;
  pages: number;
  studyType: string;
  stopPoint: string;
  focusTime?: string;
  pauseTime?: string;
}

interface MissionReportViewProps {
  subjectName: string;
  topicName: string;
  totalTime: string;
  focusTime: string;
  pauseTime: string;
  onSave: (data: MissionReportData) => void;
  onBack: () => void;
  onDiscard: () => void;
}

const MissionReportView: React.FC<MissionReportViewProps> = ({
  subjectName,
  topicName,
  totalTime,
  focusTime,
  pauseTime,
  onSave,
  onBack,
  onDiscard,
}) => {
  const { isDarkMode } = useApp();
  const [editedFocusTime, setEditedFocusTime] = useState(focusTime);
  const [editedPauseTime, setEditedPauseTime] = useState(pauseTime);
  const [isEditingFocus, setIsEditingFocus] = useState(false);
  const [isEditingPause, setIsEditingPause] = useState(false);
  
  const [exercises, setExercises] = useState(0);
  const [pages, setPages] = useState(0);
  const [studyType, setStudyType] = useState('Teoria + Exercícios');
  const [stopPoint, setStopPoint] = useState('');

  const handleSave = () => {
    onSave({
      exercises,
      pages,
      studyType,
      stopPoint,
      focusTime: editedFocusTime,
      pauseTime: editedPauseTime
    });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#F1F5F9] dark:bg-[#111821] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-y-auto font-display pb-28">
      <style>{`
        .hud-title-line {
            height: 2px;
            background: linear-gradient(90deg, transparent, #E2E8F0, transparent);
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
      `}</style>
      
      <header className="pt-8 pb-4 px-4 text-center relative">
        <button 
          onClick={onBack}
          className="absolute left-4 top-8 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <div className="hud-title-line mb-2 w-1/2 mx-auto"></div>
        <h1 className="text-[10px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">Resumo da Missão</h1>
        <h2 className="text-2xl font-black text-[#1978e5] mt-1 uppercase tracking-tight">{subjectName} - {topicName}</h2>
        <div className="hud-title-line mt-2 w-1/2 mx-auto"></div>
      </header>

      <main className="px-4 max-w-md mx-auto flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <span className="material-icons-round absolute -right-2 -bottom-2 text-6xl text-[#1978e5] opacity-10 rotate-12 group-hover:scale-110 transition-transform">bolt</span>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Foco Líquido</span>
                  {isEditingFocus ? (
                    <input 
                      type="text" 
                      value={editedFocusTime} 
                      onChange={(e) => setEditedFocusTime(e.target.value)}
                      onBlur={() => setIsEditingFocus(false)}
                      autoFocus
                      className="text-2xl font-black text-slate-900 dark:text-white bg-transparent border-b border-[#1978e5] w-full focus:outline-none"
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{focusTime}</span>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditingFocus(true)}
                  className="text-[10px] font-bold text-[#1978e5] mt-2 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-fit px-2 py-1 -ml-2 rounded-lg transition-colors"
                >
                  <span className="material-icons-round text-sm">edit</span> Editar
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <span className="material-icons-round absolute -right-2 -bottom-2 text-6xl text-orange-500 opacity-10 rotate-12 group-hover:scale-110 transition-transform">coffee</span>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Pausa Total</span>
                  {isEditingPause ? (
                    <input 
                      type="text" 
                      value={editedPauseTime} 
                      onChange={(e) => setEditedPauseTime(e.target.value)}
                      onBlur={() => setIsEditingPause(false)}
                      autoFocus
                      className="text-2xl font-black text-slate-900 dark:text-white bg-transparent border-b border-orange-500 w-full focus:outline-none"
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{pauseTime}</span>
                  )}
                </div>
                <button 
                  onClick={() => setIsEditingPause(true)}
                  className="text-[10px] font-bold text-[#1978e5] mt-2 flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-fit px-2 py-1 -ml-2 rounded-lg transition-colors"
                >
                  <span className="material-icons-round text-sm">edit</span> Editar
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#1978e5]/10 dark:bg-[#1978e5]/20 rounded-xl p-3 flex items-center justify-between border border-[#1978e5]/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1978e5]/20 flex items-center justify-center text-[#1978e5]">
                <span className="material-icons-round text-lg">schedule</span>
              </div>
              <span className="text-[11px] font-bold text-[#1978e5] uppercase tracking-wide">Tempo Total da Sessão</span>
            </div>
            <span className="text-lg font-black text-[#1978e5] tabular-nums">{totalTime}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="material-icons-round text-[#1978e5]">equalizer</span>
            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Volume de Estudo</h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                <span className="material-icons-round text-xl">calendar_today</span>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Data</label>
                <input 
                  className="w-full border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-medium focus:ring-[#1978e5] focus:border-[#1978e5] bg-slate-50 dark:bg-slate-800 dark:text-white" 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#1978e5] border border-blue-100 dark:border-blue-800">
                <span className="material-icons-round text-xl">category</span>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Tipo de Estudo</label>
                <div className="relative">
                  <select 
                    value={studyType}
                    onChange={(e) => setStudyType(e.target.value)}
                    className="w-full border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm font-medium focus:ring-[#1978e5] focus:border-[#1978e5] bg-slate-50 dark:bg-slate-800 dark:text-white appearance-none pr-8"
                  >
                    <option>Teoria + Exercícios</option>
                    <option>Apenas Teoria</option>
                    <option>Simulado</option>
                    <option>Revisão</option>
                  </select>
                  <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Exercícios</label>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 group focus-within:ring-2 focus-within:ring-[#1978e5]/20 focus-within:border-[#1978e5] transition-all">
                  <button 
                    onClick={() => setExercises(Math.max(0, exercises - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-700 hover:text-[#1978e5] hover:shadow-sm rounded-md transition-all active:scale-95"
                  >
                    <span className="material-icons-round text-base">remove</span>
                  </button>
                  <input 
                    className="w-full border-none p-0 text-center text-sm font-bold bg-transparent focus:ring-0 text-[#1978e5] dark:text-blue-400" 
                    type="number" 
                    value={exercises}
                    onChange={(e) => setExercises(parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={() => setExercises(exercises + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-700 hover:text-[#1978e5] hover:shadow-sm rounded-md transition-all active:scale-95"
                  >
                    <span className="material-icons-round text-base">add</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Páginas</label>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 group focus-within:ring-2 focus-within:ring-[#1978e5]/20 focus-within:border-[#1978e5] transition-all">
                  <button 
                    onClick={() => setPages(Math.max(0, pages - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-700 hover:text-[#1978e5] hover:shadow-sm rounded-md transition-all active:scale-95"
                  >
                    <span className="material-icons-round text-base">remove</span>
                  </button>
                  <input 
                    className="w-full border-none p-0 text-center text-sm font-bold bg-transparent focus:ring-0 text-[#1978e5] dark:text-blue-400" 
                    type="number" 
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={() => setPages(pages + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-700 hover:text-[#1978e5] hover:shadow-sm rounded-md transition-all active:scale-95"
                  >
                    <span className="material-icons-round text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ponto de Parada</h3>
          <textarea 
            value={stopPoint}
            onChange={(e) => setStopPoint(e.target.value)}
            className="w-full min-h-[120px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm focus:border-[#1978e5] focus:ring-1 focus:ring-[#1978e5] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none dark:text-white" 
            placeholder="Descreva aqui onde parou para facilitar a retomada..."
          ></textarea>
        </div>

        <div className="bg-gradient-to-br from-[#1978e5] to-blue-700 p-4 rounded-xl shadow-lg flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-icons-round text-[#F59E0B] text-3xl">military_tech</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Recompensa da Missão</span>
              <p className="text-xl font-black">+145 XP <span className="text-xs font-normal opacity-70 ml-1">Acumulados</span></p>
            </div>
          </div>
          <span className="material-icons-round opacity-50">arrow_forward_ios</span>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#1978e5] text-white font-black py-4 rounded-xl shadow-md active:scale-[0.98] transition-all uppercase tracking-widest text-sm mt-2"
        >
          Salvar e Finalizar
        </button>
        
        <button 
          onClick={onDiscard}
          className="w-full bg-transparent text-red-500 dark:text-red-400 font-bold py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all uppercase tracking-widest text-xs"
        >
          Cancelar / Não Salvar
        </button>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 pb-6 pt-2 flex justify-around items-center z-50 h-[84px]">
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 w-16 pt-3">
          <span className="material-icons-round text-2xl">home</span>
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <div className="relative flex flex-col items-center justify-center w-16 pt-3">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1978e5] rounded-full"></div>
          <span className="material-icons-round text-2xl text-[#1978e5]">donut_large</span>
          <span className="text-[10px] font-bold text-[#1978e5]">Ciclo</span>
        </div>
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 w-16 pt-3">
          <span className="material-symbols-outlined text-2xl">swords</span>
          <span className="text-[10px] font-medium">Batalha</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 w-16 pt-3">
          <span className="material-symbols-outlined text-2xl">account_balance</span>
          <span className="text-[10px] font-medium">Coliseu</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400 w-16 pt-3">
          <span className="material-icons-round text-2xl">more_horiz</span>
          <span className="text-[10px] font-medium">Mais</span>
        </button>
      </nav>
    </div>
  );
};

export default MissionReportView;
