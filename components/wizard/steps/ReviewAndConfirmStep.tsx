import React from 'react';
import { WizardState } from '../../../types/wizard.types';
import { format } from 'date-fns';
import { LEVEL_LABELS } from '../../../utils/priorityUtils';

interface StepProps {
  state: WizardState;
  onNext?: () => void;
  onBack?: () => void;
}

const ReviewAndConfirmStep: React.FC<StepProps> = ({ state }) => {
  const getObjectiveLabel = () => {
    switch (state.objective) {
      case 'enem': return 'ENEM';
      case 'oab': return 'OAB';
      case 'concurso': return 'Concurso Público';
      case 'faculdade': return 'Faculdade';
      case 'custom': return 'Outro';
      default: return 'Não definido';
    }
  };

  const summaryItems = [
    {
      icon: 'target',
      label: 'Objetivo',
      value: getObjectiveLabel(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    ...(state.selectedPosition ? [{
      icon: 'work',
      label: 'Cargo',
      value: state.selectedPosition,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }] : []),
    ...(state.banca ? [{
      icon: 'account_balance',
      label: 'Banca',
      value: state.banca,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }] : []),
    {
      icon: 'event',
      label: 'Data da Prova',
      value: state.deadline ? format(new Date(state.deadline + 'T12:00:00'), "dd/MM/yyyy") : 'Não definida',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: 'schedule',
      label: 'Carga Horária',
      value: `${state.weeklyHours}h semanais`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: 'timer',
      label: 'Pomodoro',
      value: `${state.timerSettings.focusTime}min foco`,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tudo pronto!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Revise suas configurações antes de gerarmos seu plano de estudos.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Resumo Geral</h3>
          <div className="grid grid-cols-1 gap-3">
            {summaryItems.map((item, index) => (
              <div key={index} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-blue-500/30 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Matérias ({state.subjects.length})</h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 max-h-[320px] overflow-y-auto no-scrollbar space-y-2 shadow-sm">
            {state.subjects.map((subject) => (
              <div key={subject.id} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-blue-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)]" style={{ backgroundColor: subject.color }} />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{subject.name}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-wider border border-slate-200 dark:border-slate-800">
                    {subject.topics.length} tópicos
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg uppercase tracking-wider border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Prioridade {subject.priority || 3}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg uppercase tracking-wider border border-blue-200 dark:border-blue-800/50">
                    {LEVEL_LABELS[subject.level || 'iniciante']}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-500/20 mt-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-1">Pronto para a aprovação?</h4>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Ao finalizar, nossa IA irá organizar cada matéria e tópico em um cronograma inteligente baseado no seu ritmo.
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
      </div>
    </div>
  );
};

export default ReviewAndConfirmStep;
