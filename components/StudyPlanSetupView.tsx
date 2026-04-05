import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Objective {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const OBJECTIVES: Objective[] = [
  {
    id: 'oab',
    title: 'Exame da OAB',
    description: 'Preparação completa para a 1ª e 2ª fase do Exame de Ordem.',
    icon: 'gavel',
    color: 'indigo'
  },
  {
    id: 'concursos',
    title: 'Concursos Públicos',
    description: 'Foco em editais específicos de tribunais, polícia e fiscal.',
    icon: 'account_balance',
    color: 'emerald'
  },
  {
    id: 'enem',
    title: 'ENEM & Vestibulares',
    description: 'Cronograma focado nas matérias que mais caem nas provas.',
    icon: 'school',
    color: 'amber'
  },
  {
    id: 'residência',
    title: 'Residência Médica',
    description: 'Estudo direcionado para as principais instituições do país.',
    icon: 'medical_services',
    color: 'rose'
  },
  {
    id: 'idiomas',
    title: 'Idiomas',
    description: 'Prática diária para fluência em Inglês, Espanhol ou Francês.',
    icon: 'translate',
    color: 'sky'
  },
  {
    id: 'personalizado',
    title: 'Personalizado',
    description: 'Crie seu próprio plano do zero para qualquer objetivo.',
    icon: 'tune',
    color: 'slate'
  }
];

interface StudyPlanSetupViewProps {
  onComplete: (objectiveId: string) => void;
}

const StudyPlanSetupView: React.FC<StudyPlanSetupViewProps> = ({ onComplete }) => {
  const [selectedId, setSelectedId] = useState<string>('oab');

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">bolt</span>
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">FocusFlow</span>
          </div>

          <nav className="space-y-1">
            <SidebarLink icon="home" label="Início" active />
            <SidebarLink icon="menu_book" label="Plano de Estudos" />
            <SidebarLink icon="insights" label="Desempenho" />
            <SidebarLink icon="settings" label="Configurações" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Eringryd</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Plano Premium</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Plano de Estudos</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-white">Novo Plano</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">dark_mode</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Novo Plano de Estudos</h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">Escolha seu objetivo principal para começar a organizar sua jornada.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {OBJECTIVES.map((obj) => (
                <ObjectiveCard
                  key={obj.id}
                  objective={obj}
                  isSelected={selectedId === obj.id}
                  onClick={() => setSelectedId(obj.id)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
              <button className="px-6 py-3 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                Voltar
              </button>
              <button 
                onClick={() => onComplete(selectedId)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Próximo
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface SidebarLinkProps {
  icon: string;
  label: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    {label}
  </a>
);

interface ObjectiveCardProps {
  objective: Objective;
  isSelected: boolean;
  onClick: () => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, isSelected, onClick }) => {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  };

  const borderClasses = isSelected
    ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white dark:bg-slate-900'
    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700';

  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${borderClasses}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${colorClasses[objective.color]}`}>
          <span className="material-symbols-outlined text-2xl">{objective.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{objective.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{objective.description}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-700'
        }`}>
          {isSelected && <span className="material-symbols-outlined text-white text-xs font-bold">check</span>}
        </div>
      </div>
    </button>
  );
};

export default StudyPlanSetupView;
