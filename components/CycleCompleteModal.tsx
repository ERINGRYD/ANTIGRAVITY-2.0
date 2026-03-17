import React from 'react';

interface CycleCompleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const CycleCompleteModal: React.FC<CycleCompleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="material-symbols-outlined text-3xl">emoji_events</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Ciclo Concluído!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Parabéns! Você completou todas as metas do seu ciclo de estudos. Deseja reiniciar o progresso das matérias para começar um novo ciclo?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Agora não
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-colors"
            >
              Reiniciar Ciclo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleCompleteModal;
