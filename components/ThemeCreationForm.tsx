/**
 * Theme Creation Form Component
 * 
 * Design Decisions:
 * 1. Lightweight Interaction: Implemented as an inline/modal form to prevent context switching.
 *    Users are often in "planning mode" when adding themes, so speed is key.
 * 2. Dynamic Subtopics: Allows adding multiple subtopics at once to support bulk entry.
 * 3. Client-side Validation: Immediate feedback prevents frustration and ensures data integrity before submission.
 * 4. Accessibility: Uses standard HTML validation attributes and aria-labels for screen readers.
 */

import React, { useState } from 'react';
import { Theme, Subtopic } from '../types';

interface ThemeCreationFormProps {
  subjectId: string;
  currentThemeCount: number;
  onThemeCreated: (theme: Theme) => void;
  onCancel: () => void;
}

const ThemeCreationForm: React.FC<ThemeCreationFormProps> = ({ 
  subjectId, 
  currentThemeCount, 
  onThemeCreated, 
  onCancel 
}) => {
  const [name, setName] = useState('');
  const [goalTime, setGoalTime] = useState<string>(''); // String to handle empty state
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; goalTime?: string; subtopics?: string[] }>({});

  const handleAddSubtopic = () => {
    if (subtopics.length < 20) {
      setSubtopics([...subtopics, '']);
    }
  };

  const handleSubtopicChange = (index: number, value: string) => {
    const newSubtopics = [...subtopics];
    newSubtopics[index] = value;
    setSubtopics(newSubtopics);
    
    // Clear error for this specific subtopic if it exists
    if (errors.subtopics && errors.subtopics[index]) {
      const newSubtopicErrors = [...errors.subtopics];
      delete newSubtopicErrors[index];
      setErrors({ ...errors, subtopics: newSubtopicErrors });
    }
  };

  const handleRemoveSubtopic = (index: number) => {
    const newSubtopics = subtopics.filter((_, i) => i !== index);
    setSubtopics(newSubtopics);
    
    // Adjust errors array if it exists
    if (errors.subtopics) {
      const newSubtopicErrors = errors.subtopics.filter((_, i) => i !== index);
      setErrors({ ...errors, subtopics: newSubtopicErrors });
    }
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; goalTime?: string; subtopics?: string[] } = {};
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = "O nome do tema não pode estar vazio";
      isValid = false;
    } else if (name.length > 100) {
      newErrors.name = "O nome deve ter no máximo 100 caracteres";
      isValid = false;
    }

    // Goal Time validation
    const minutes = parseInt(goalTime);
    if (!goalTime || isNaN(minutes)) {
      newErrors.goalTime = "Defina uma meta de tempo";
      isValid = false;
    } else if (minutes < 1 || minutes > 600) {
      newErrors.goalTime = "Defina uma meta entre 1 e 600 minutos";
      isValid = false;
    }

    // Subtopics validation
    const subtopicErrors: string[] = [];
    subtopics.forEach((st, index) => {
      if (!st.trim()) {
        subtopicErrors[index] = "O nome do subtópico não pode estar vazio";
        isValid = false;
      }
    });
    if (subtopicErrors.length > 0) {
      newErrors.subtopics = subtopicErrors;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const newSubtopics: Subtopic[] = subtopics.map(stName => ({
      id: crypto.randomUUID(),
      name: stName.trim(),
      isCompleted: false,
      completionSource: null
    }));

    const newTheme: Theme = {
      id: crypto.randomUUID(),
      subjectId,
      name: name.trim(),
      order: currentThemeCount,
      goalTime: parseInt(goalTime),
      accumulatedTime: 0,
      isCompleted: false,
      completionSource: null,
      subtopics: newSubtopics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onThemeCreated(newTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Novo Tema</h3>
          <button 
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Fechar"
          >
            <span className="material-icons-round text-lg">close</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          
          {/* Theme Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="themeName" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nome do Tema <span className="text-red-500">*</span>
            </label>
            <input
              id="themeName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Funções do 2º Grau"
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'} rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <span id="name-error" className="text-xs font-medium text-red-500 flex items-center gap-1">
                <span className="material-icons-round text-[10px]">error</span> {errors.name}
              </span>
            )}
          </div>

          {/* Goal Time */}
          <div className="flex flex-col gap-2">
            <label htmlFor="goalTime" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Meta de Tempo (minutos) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="goalTime"
                type="number"
                value={goalTime}
                onChange={(e) => setGoalTime(e.target.value)}
                placeholder="Ex: 60"
                min="1"
                max="600"
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.goalTime ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'} rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all pr-12`}
                aria-invalid={!!errors.goalTime}
                aria-describedby={errors.goalTime ? "goal-error" : undefined}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">min</span>
            </div>
            {errors.goalTime && (
              <span id="goal-error" className="text-xs font-medium text-red-500 flex items-center gap-1">
                <span className="material-icons-round text-[10px]">error</span> {errors.goalTime}
              </span>
            )}
          </div>

          {/* Subtopics */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subtópicos (Opcional)
              </label>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {subtopics.length}/20
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {subtopics.map((subtopic, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                    <span className="text-xs font-mono text-slate-400 w-4">{index + 1}.</span>
                    <input
                      type="text"
                      value={subtopic}
                      onChange={(e) => handleSubtopicChange(index, e.target.value)}
                      placeholder="Nome do subtópico"
                      className={`flex-1 bg-white dark:bg-slate-900 border ${errors.subtopics && errors.subtopics[index] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors`}
                      autoFocus={index === subtopics.length - 1} // Auto-focus new inputs
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtopic(index)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label={`Remover subtópico ${index + 1}`}
                    >
                      <span className="material-icons-round text-lg">close</span>
                    </button>
                  </div>
                  {errors.subtopics && errors.subtopics[index] && (
                    <span className="text-[10px] font-medium text-red-500 ml-8">
                      {errors.subtopics[index]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {subtopics.length < 20 && (
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="mt-2 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-icons-round text-lg">add</span>
                Adicionar Subtópico
              </button>
            )}
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl text-sm font-bold uppercase tracking-wide shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">check</span>
            Salvar Tema
          </button>
        </div>

      </div>
    </div>
  );
};

export default ThemeCreationForm;
