
import React, { useState } from 'react';
import { Goal } from '../types';
import { useApp } from '../contexts/AppContext';

interface GoalsManagementViewProps {
  goals: Goal[];
  onBack: () => void;
  onUpdate: (updatedGoals: Goal[]) => void;
}

const GoalsManagementView: React.FC<GoalsManagementViewProps> = ({ goals, onBack, onUpdate }) => {
  const { isDarkMode } = useApp();
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      // FIX: Added missing required properties from Goal interface
      const newGoal: Goal = {
        id: `goal-${crypto.randomUUID()}`,
        title: newGoalTitle.trim(),
        isCompleted: false,
        targetMinutes: 0,
        currentMinutes: 0,
        weekStart: new Date().toISOString()
      };
      setLocalGoals(prev => [newGoal, ...prev]);
      setNewGoalTitle('');
    }
  };

  const handleToggleGoal = (id: string) => {
    setLocalGoals(prev => prev.map(g => g.id === id ? { ...g, isCompleted: !g.isCompleted } : g));
  };

  const handleRemoveGoal = (id: string) => {
    setLocalGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleSave = () => {
    onUpdate(localGoals);
    onBack();
  };

  const completedCount = localGoals.filter(g => g.isCompleted).length;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-12 h-12 flex items-center justify-center -ml-3 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
              <span className="material-icons-round text-2xl">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Metas Semanais</h1>
              <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                {completedCount} de {localGoals.length} concluídas
              </p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Confirmar
          </button>
        </div>
      </header>

      <main className="px-5 py-8 max-w-2xl mx-auto w-full space-y-8">
        {/* Progress Summary */}
        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke={isDarkMode ? "#1E293B" : "#F1F5F9"} strokeWidth="10" />
              <circle 
                cx="50" cy="50" r="45" fill="transparent" 
                stroke="#3B82F6" strokeWidth="10" 
                strokeDasharray="282.7" 
                strokeDashoffset={282.7 - (282.7 * (localGoals.length > 0 ? (completedCount / localGoals.length) : 0))}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {localGoals.length > 0 ? Math.round((completedCount / localGoals.length) * 100) : 0}%
              </span>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Concluído</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Mantenha a Constância</h2>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Metas semanais ajudam a manter o foco no longo prazo.</p>
          </div>
        </section>

        {/* Add New Goal */}
        <form onSubmit={handleAddGoal} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Criar Nova Meta</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl px-5 py-4 focus:ring-0 transition-all text-slate-900 dark:text-white font-bold outline-none" 
              placeholder="Ex: Estudar 4h de Física" 
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-slate-900 dark:bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <span className="material-icons-round">add</span>
            </button>
          </div>
        </form>

        {/* Goals List */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Lista de Objetivos</h3>
          <div className="space-y-3">
            {localGoals.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-slate-300 dark:text-slate-700 font-bold text-sm italic">Sua lista está vazia. Comece definindo seu primeiro objetivo!</p>
              </div>
            ) : (
              localGoals.map(goal => (
                <div 
                  key={goal.id} 
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm flex items-center justify-between group transition-all ${
                    goal.isCompleted ? 'border-slate-50 dark:border-slate-800 opacity-75' : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${
                        goal.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent hover:border-blue-300'
                      }`}
                    >
                      <span className="material-icons-round text-base">check</span>
                    </button>
                    <span className={`font-bold text-sm transition-all ${goal.isCompleted ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {goal.title}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                  >
                    <span className="material-icons-round text-xl">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default GoalsManagementView;
