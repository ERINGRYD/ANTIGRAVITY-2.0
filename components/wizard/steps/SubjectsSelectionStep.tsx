import React, { useState, useEffect } from 'react';
import { WizardState, WizardSubject, WizardTopic } from '../../../types/wizard.types';
import StarRating from '../../StarRating';
import { WIZARD_PREDEFINED_TOPICS } from '../../../constants/wizardPredefinedTopics';

interface StepProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const FOCUS_OPTIONS_BY_OBJECTIVE: Record<string, Array<{ id: string; label: string; icon: string }>> = {
  enem: [
    { id: 'Exatas', label: 'Exatas', icon: 'calculate' },
    { id: 'Humanas', label: 'Humanas', icon: 'history_edu' },
    { id: 'Biologicas', label: 'Biológicas', icon: 'biotech' },
    { id: 'Linguagens', label: 'Linguagens', icon: 'translate' },
  ],
  oab: [
    { id: 'Direito', label: 'Direito', icon: 'gavel' },
    { id: 'Gerais', label: 'Gerais', icon: 'public' },
  ],
  concurso: [
    { id: 'Direito', label: 'Direito', icon: 'gavel' },
    { id: 'Gerais', label: 'Gerais', icon: 'public' },
    { id: 'Linguagens', label: 'Linguagens', icon: 'translate' },
  ],
  default: [
    { id: 'Exatas', label: 'Exatas', icon: 'calculate' },
    { id: 'Humanas', label: 'Humanas', icon: 'history_edu' },
    { id: 'Biologicas', label: 'Biológicas', icon: 'biotech' },
    { id: 'Linguagens', label: 'Linguagens', icon: 'translate' },
  ]
};

const SUGGESTIONS = {
  Exatas: [
    { name: 'Matemática', color: '#3B82F6' },
    { name: 'Física', color: '#8B5CF6' },
    { name: 'Química', color: '#EC4899' },
    { name: 'Estatística', color: '#06B6D4' },
  ],
  Humanas: [
    { name: 'História', color: '#F59E0B' },
    { name: 'Geografia', color: '#10B981' },
    { name: 'Sociologia', color: '#F43F5E' },
    { name: 'Filosofia', color: '#84CC16' },
  ],
  Biologicas: [
    { name: 'Biologia', color: '#22C55E' },
    { name: 'Genética', color: '#14B8A6' },
    { name: 'Anatomia', color: '#EF4444' },
    { name: 'Ecologia', color: '#8B5CF6' },
  ],
  Linguagens: [
    { name: 'Português', color: '#EAB308' },
    { name: 'Inglês', color: '#3B82F6' },
    { name: 'Literatura', color: '#D946EF' },
    { name: 'Artes', color: '#F97316' },
  ],
  Direito: [
    { name: 'Direito Civil', color: '#3B82F6' },
    { name: 'Direito Penal', color: '#EF4444' },
    { name: 'Direito Administrativo', color: '#10B981' },
    { name: 'Direito Constitucional', color: '#8B5CF6' },
    { name: 'Direito do Trabalho', color: '#F59E0B' },
    { name: 'Direito Tributário', color: '#06B6D4' },
    { name: 'Ética Profissional', color: '#64748B' },
  ],
  Gerais: [
    { name: 'Raciocínio Lógico', color: '#6366F1' },
    { name: 'Informática', color: '#0EA5E9' },
    { name: 'Atualidades', color: '#14B8A6' },
  ]
};

const RECOMMENDED_BY_OBJECTIVE: Record<string, Array<{ name: string; color: string; category: string }>> = {
  enem: [
    { name: 'Matemática', color: '#3B82F6', category: 'Exatas' },
    { name: 'Física', color: '#8B5CF6', category: 'Exatas' },
    { name: 'Química', color: '#EC4899', category: 'Exatas' },
    { name: 'Biologia', color: '#22C55E', category: 'Biologicas' },
    { name: 'História', color: '#F59E0B', category: 'Humanas' },
    { name: 'Geografia', color: '#10B981', category: 'Humanas' },
    { name: 'Sociologia', color: '#F43F5E', category: 'Humanas' },
    { name: 'Filosofia', color: '#84CC16', category: 'Humanas' },
    { name: 'Português', color: '#EAB308', category: 'Linguagens' },
    { name: 'Literatura', color: '#D946EF', category: 'Linguagens' },
    { name: 'Inglês', color: '#3B82F6', category: 'Linguagens' },
  ],
  oab: [
    { name: 'Ética Profissional', color: '#64748B', category: 'Direito' },
    { name: 'Direito Civil', color: '#3B82F6', category: 'Direito' },
    { name: 'Direito Penal', color: '#EF4444', category: 'Direito' },
    { name: 'Direito Administrativo', color: '#10B981', category: 'Direito' },
    { name: 'Direito Constitucional', color: '#8B5CF6', category: 'Direito' },
    { name: 'Direito do Trabalho', color: '#F59E0B', category: 'Direito' },
    { name: 'Direito Tributário', color: '#06B6D4', category: 'Direito' },
  ],
  concurso: [
    { name: 'Português', color: '#EAB308', category: 'Linguagens' },
    { name: 'Raciocínio Lógico', color: '#6366F1', category: 'Gerais' },
    { name: 'Informática', color: '#0EA5E9', category: 'Gerais' },
    { name: 'Direito Administrativo', color: '#10B981', category: 'Direito' },
    { name: 'Direito Constitucional', color: '#8B5CF6', category: 'Direito' },
  ]
};

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#F43F5E', '#06B6D4'];

const SubjectsSelectionStep: React.FC<StepProps> = ({ state, updateState }) => {
  const [newSubjectName, setNewSubjectName] = useState('');

  // Persist focus to localStorage
  useEffect(() => {
    const savedFocus = localStorage.getItem('wizard_focus');
    if (savedFocus && !state.focus) {
      updateState({ focus: savedFocus });
    }
  }, []);

  useEffect(() => {
    if (state.focus) {
      localStorage.setItem('wizard_focus', state.focus);
    } else {
      localStorage.removeItem('wizard_focus');
    }
  }, [state.focus]);

  const handleAddSubject = (name: string, color?: string, category?: string) => {
    if (!name.trim()) return;
    if (state.subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) return;

    // Infer category if not provided
    let inferredCategory = category;
    if (!inferredCategory) {
      for (const [cat, subjects] of Object.entries(SUGGESTIONS)) {
        if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
          inferredCategory = cat;
          break;
        }
      }
    }

    const predefinedTopics = WIZARD_PREDEFINED_TOPICS[name.trim()] || [];
    
    // Deep clone predefined topics to ensure unique IDs
    const topics: WizardTopic[] = predefinedTopics.map(t => ({
      ...t,
      id: `t-${crypto.randomUUID()}`,
      subtopics: t.subtopics?.map(st => ({
        ...st,
        id: `st-${crypto.randomUUID()}`
      }))
    }));

    const newSubject: WizardSubject = {
      id: `s-${crypto.randomUUID()}`,
      name: name.trim(),
      color: color || COLORS[state.subjects.length % COLORS.length],
      category: inferredCategory || 'Custom',
      topics: topics,
      level: null,
      priority: 1
    };

    updateState({ subjects: [...state.subjects, newSubject] });
    setNewSubjectName('');
  };

  const handleAddRecommended = () => {
    const recommended = RECOMMENDED_BY_OBJECTIVE[state.objective || ''] || [];
    if (recommended.length === 0) return;

    const newSubjects = [...state.subjects];
    recommended.forEach(rec => {
      if (!newSubjects.find(s => s.name.toLowerCase() === rec.name.toLowerCase())) {
        const predefinedTopics = WIZARD_PREDEFINED_TOPICS[rec.name] || [];
        
        // Deep clone predefined topics to ensure unique IDs
        const topics: WizardTopic[] = predefinedTopics.map(t => ({
          ...t,
          id: `t-${crypto.randomUUID()}`,
          subtopics: t.subtopics?.map(st => ({
            ...st,
            id: `st-${crypto.randomUUID()}`
          }))
        }));

        newSubjects.push({
          id: `s-${crypto.randomUUID()}`,
          name: rec.name,
          color: rec.color,
          category: rec.category,
          topics: topics,
          level: null,
          priority: 1
        });
      }
    });

    updateState({ subjects: newSubjects });
  };

  const currentFocusOptions = FOCUS_OPTIONS_BY_OBJECTIVE[state.objective || 'default'] || FOCUS_OPTIONS_BY_OBJECTIVE.default;

  const handleRemoveSubject = (id: string) => {
    updateState({ subjects: state.subjects.filter(s => s.id !== id) });
  };

  const handlePriorityChange = (subjectId: string, newPriority: number) => {
    updateState({
      subjects: state.subjects.map(s => 
        s.id === subjectId ? { ...s, priority: newPriority } : s
      )
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      <section className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Quais matérias você vai estudar?</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Selecione as disciplinas para montarmos seu cronograma.</p>
      </section>

      {/* Focus Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foco Principal</h3>
          {state.focus && (
            <button 
              onClick={() => updateState({ focus: null })}
              className="text-[10px] font-bold text-blue-600 hover:underline"
            >
              Limpar Filtro
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentFocusOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => updateState({ focus: state.focus === option.id ? null : option.id })}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                state.focus === option.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 ring-2 ring-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-blue-300'
              }`}
            >
              <span className="material-symbols-outlined mb-2">{option.icon}</span>
              <span className="text-xs font-bold">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Add Section */}
      <div className="relative">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAddSubject(newSubjectName); }}
          className="flex gap-3"
        >
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm dark:text-white" 
              placeholder="Buscar matérias..." 
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {Object.entries(SUGGESTIONS)
          .filter(([category]) => !state.focus || category === state.focus)
          .map(([category, subjects]) => (
          <div key={category}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">{category}</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {subjects.map((sub) => {
                const isSelected = state.subjects.some(s => s.name === sub.name);
                return (
                  <button
                    key={sub.name}
                    onClick={() => isSelected ? null : handleAddSubject(sub.name, sub.color, category)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full border transition-all active:scale-95 font-medium ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected List Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Matérias Selecionadas</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              {state.subjects.length} {state.subjects.length === 1 ? 'total' : 'totais'}
            </span>
          </div>
        </div>

        {state.subjects.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">category</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhuma matéria adicionada ainda.</p>
            </div>
            
            {state.objective && RECOMMENDED_BY_OBJECTIVE[state.objective] && (
              <button 
                onClick={handleAddRecommended}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                Adicionar matérias recomendadas para {state.objective.toUpperCase()}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {state.subjects.map((subject) => (
              <div 
                key={subject.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex flex-col">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{subject.name}</h4>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{subject.category}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSubject(subject.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Prioridade</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      Nível {subject.priority || 1}
                    </span>
                  </div>
                  <StarRating
                    value={subject.priority || 1}
                    onChange={(val) => handlePriorityChange(subject.id, val)}
                    size="md"
                    accentColor={subject.color}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsSelectionStep;
