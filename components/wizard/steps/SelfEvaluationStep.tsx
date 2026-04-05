import React from 'react';
import { WizardState, WizardSubject } from '../../../types/wizard.types';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const levels = [
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'intermediario', label: 'Intermediário' },
  { id: 'avancado', label: 'Avançado' },
] as const;

const SelfEvaluationStep: React.FC<StepProps> = ({ state, updateState }) => {
  const handleLevelChange = (subjectId: string, level: WizardSubject['level']) => {
    const updatedSubjects = state.subjects.map(s => 
      s.id === subjectId ? { ...s, level } : s
    );
    updateState({ subjects: updatedSubjects });
  };

  const renderBars = (levelId: string, isSelected: boolean) => {
    const barConfigs = {
      iniciante: [
        { height: 'h-3', color: isSelected ? 'bg-red-500' : 'bg-red-400/50' },
        { height: 'h-4', color: 'bg-slate-200 dark:bg-slate-700' },
        { height: 'h-6', color: 'bg-slate-200 dark:bg-slate-700' },
      ],
      intermediario: [
        { height: 'h-3', color: isSelected ? 'bg-amber-400' : 'bg-amber-400/50' },
        { height: 'h-4', color: isSelected ? 'bg-amber-400' : 'bg-amber-400/50' },
        { height: 'h-6', color: 'bg-slate-200 dark:bg-slate-700' },
      ],
      avancado: [
        { height: 'h-3', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
        { height: 'h-4', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
        { height: 'h-6', color: isSelected ? 'bg-emerald-500' : 'bg-emerald-500/50' },
      ],
    };

    const bars = barConfigs[levelId as keyof typeof barConfigs];

    return (
      <div className="flex gap-1 h-6 items-end">
        {bars.map((bar, i) => (
          <div 
            key={i} 
            className={`w-2.5 ${bar.height} rounded-sm ${bar.color}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Como está seu nível?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Sua autoavaliação ajuda a priorizar o que você mais precisa.</p>
      </section>

      <div className="space-y-4">
        {state.subjects.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhuma matéria selecionada. Volte e adicione matérias.</p>
          </div>
        ) : (
          <>
            {state.subjects.map((subject) => (
              <div 
                key={subject.id} 
                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                    >
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                      <p className="text-xs text-slate-500">{subject.topics.length} tópicos selecionados</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {levels.map((level) => {
                    const isSelected = subject.level === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleLevelChange(subject.id, level.id)}
                        className={`flex flex-col items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                          isSelected 
                            ? 'border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-50 dark:ring-blue-900/10' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                        }`}
                      >
                        {renderBars(level.id, isSelected)}
                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                          isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'
                        }`}>
                          {level.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Context Footer Note */}
            <div className="flex items-start gap-3 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl mt-6 border border-dashed border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">info</span>
              <p className="text-xs text-slate-500 italic leading-relaxed">
                Seu nível influencia o peso da matéria no cronograma. Matérias de nível "Iniciante" receberão mais blocos de estudo.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelfEvaluationStep;
