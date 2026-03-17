/*
  Empty State Component:
  - Displayed when the subject list is empty (subjects.length === 0).
  - Provides a clear call-to-action to add a new subject.
  - Uses existing design system styles (Tailwind CSS) for consistency.
  - Centered layout with an icon, title, description, and primary button.
*/

import React from 'react';

interface EmptyStateProps {
  onAddSubject: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddSubject }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="material-icons-round text-4xl text-slate-400 dark:text-slate-500">
          library_add
        </span>
      </div>
      
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
        Nenhuma matéria no ciclo
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8 font-medium">
        Adicione uma matéria para retomar seus estudos e acompanhar seu progresso.
      </p>
      
      <button
        onClick={onAddSubject}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
      >
        <span className="material-icons-round text-xl">add</span>
        <span>Adicionar Matéria</span>
      </button>
    </div>
  );
};

export default EmptyState;
