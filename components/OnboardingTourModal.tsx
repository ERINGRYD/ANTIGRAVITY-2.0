import React from 'react';
import { Tab } from '../types';

interface OnboardingTourModalProps {
  onClose: () => void;
  onNavigateToTab: (tab: Tab) => void;
  onNavigateToManagement: () => void;
}

const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({ onClose, onNavigateToTab, onNavigateToManagement }) => {
  const handleStart = () => {
    localStorage.setItem('has_seen_tour', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner transform rotate-3">
            <span className="material-icons-round text-4xl">rocket_launch</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Bem-vindo ao Ciclo!</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sua jornada de estudos gamificada começa agora. Veja como funciona:
            </p>
          </div>

          <div className="space-y-4 text-left mt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-xl">menu_book</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">1. Crie suas Matérias</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adicione o que você precisa estudar e defina suas metas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-xl">timer</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">2. Estude com Foco</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use o timer Pomodoro para acumular tempo e XP.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-xl">swords</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">3. Derrote os Monstros</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Revise o conteúdo em batalhas épicas para não esquecer.</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"
            >
              Começar a Jornada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTourModal;
