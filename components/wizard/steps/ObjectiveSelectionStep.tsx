import React from 'react';
import { WizardState, ObjectiveType } from '../../../types/wizard.types';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: (objective?: ObjectiveType) => void;
  onBack?: () => void;
}

const OBJECTIVES: Array<{ id: ObjectiveType; title: string; description: string; icon: string; color: string }> = [
  { id: 'enem', title: 'ENEM', description: 'Foco total nas competências do MEC e preparação para o ingresso em universidades.', icon: 'school', color: 'bg-blue-600' },
  { id: 'concurso', title: 'Concursos', description: 'Conteúdo direcionado para editais de carreiras públicas federais, estaduais e municipais.', icon: 'account_balance', color: 'bg-orange-500' },
  { id: 'oab', title: 'OAB', description: 'Estratégias específicas para a 1ª e 2ª fase do Exame de Ordem Unificado.', icon: 'gavel', color: 'bg-blue-700' },
  { id: 'custom', title: 'Customizado', description: 'Crie seu próprio plano com matérias específicas de qualquer outra área de estudo.', icon: 'tune', color: 'bg-purple-600' },
];

const ObjectiveSelectionStep: React.FC<StepProps> = ({ state, updateState, onNext }) => {
  const handleSelect = (id: ObjectiveType) => {
    updateState({ objective: id });
    if (onNext) {
      onNext(id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Qual é o seu objetivo?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Selecione uma das opções abaixo para que possamos personalizar seu cronograma.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OBJECTIVES.map((obj) => {
          const isSelected = state.objective === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => handleSelect(obj.id)}
              className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'
              }`}
            >
              {/* Selection Indicator (Checkmark) */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/20">
                  <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl ${obj.color} flex items-center justify-center text-white mb-4 shadow-md transition-transform group-hover:scale-110 duration-300`}>
                <span className="material-symbols-outlined text-xl">{obj.icon}</span>
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  {obj.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {obj.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ObjectiveSelectionStep;
