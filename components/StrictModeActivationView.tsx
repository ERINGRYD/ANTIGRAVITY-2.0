
import React from 'react';
import { useApp } from '../contexts/AppContext';

interface StrictModeActivationViewProps {
  onActivate: () => void;
  onCancel: () => void;
}

const StrictModeActivationView: React.FC<StrictModeActivationViewProps> = ({ onActivate, onCancel }) => {
  const { isDarkMode } = useApp();
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0F172A]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[440px] bg-[#F8FAFC] dark:bg-slate-900 rounded-t-[2rem] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
        {/* iOS Handle */}
        <div className="w-9 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-icons-round text-[#F97316] text-3xl">lock_person</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] dark:text-white">Modo Estrito</h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-1">Nível de Foco Máximo</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[1.25rem] border border-[#E2E8F0] dark:border-slate-700 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center gap-3 p-4 border-b border-[#E2E8F0] dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-[20px]">no_accounts</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">Saída do app bloqueada</p>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">O cronômetro para se você sair da tela.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border-b border-[#E2E8F0] dark:border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500 text-[20px]">heart_broken</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">Penalidade por desistência</p>
              <p className="text-[11px] text-[#EF4444] font-bold">-50 XP de punição imediata</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-emerald-500 text-[20px]">military_tech</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">Recompensa Épica</p>
              <p className="text-[11px] text-[#10B981] font-bold">Bônus de 1.5x XP na sessão</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[#0F172A] dark:text-white font-bold text-lg italic">Pronto para o desafio?</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onActivate}
            className="w-full h-14 bg-[#F97316] text-white rounded-[1rem] font-extrabold text-base shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-110"
          >
            <span>ATIVAR E INICIAR</span>
            <span className="material-icons-round text-xl">bolt</span>
          </button>
          <button 
            onClick={onCancel}
            className="w-full h-12 bg-transparent text-[#64748B] dark:text-slate-400 rounded-[1rem] font-bold text-sm active:opacity-60 transition-opacity"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrictModeActivationView;
