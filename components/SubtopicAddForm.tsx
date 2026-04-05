/**
 * Subtopic Addition Form Component
 * 
 * Design Decisions:
 * 1. Inline Expansion: Uses a "ghost" trigger button that expands into an input field to maintain context.
 * 2. Keyboard Support: Enter to submit, Escape to cancel — critical for power user workflow.
 * 3. Re-evaluation Logic: Adding a subtopic to a completed theme will RE-OPEN the theme 
 *    (set isCompleted: false) if the completion source was 'checklist'. This is handled 
 *    by the parent component via isThemeCompleted re-check.
 * 4. Accessibility: Uses aria-expanded state and proper labelling for screen readers.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Subtopic } from '../types';

interface SubtopicAddFormProps {
  themeId: string;
  currentSubtopicCount: number;
  themeIsCompleted: boolean;
  onSubtopicAdded: (themeId: string, subtopic: Subtopic) => void;
}

const SubtopicAddForm: React.FC<SubtopicAddFormProps> = ({
  themeId,
  currentSubtopicCount,
  themeIsCompleted,
  onSubtopicAdded
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    } else if (!isExpanded && triggerRef.current) {
      // Return focus to trigger when collapsing
      // triggerRef.current.focus(); // Optional: might be annoying if user clicked away
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    setError(null);
    setName('');
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setName('');
    setError(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      setError("O nome do subtópico não pode estar vazio");
      return false;
    }
    if (name.length > 100) {
      setError("O nome deve ter no máximo 100 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newSubtopic: Subtopic = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isCompleted: false,
      completionSource: null
    };

    onSubtopicAdded(themeId, newSubtopic);
    handleCollapse();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCollapse();
    }
  };

  // Visibility Rules
  if (themeIsCompleted || currentSubtopicCount >= 20) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        ref={triggerRef}
        onClick={handleExpand}
        className="group flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all w-full"
        aria-expanded="false"
        aria-label="Adicionar novo subtópico"
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
          <span className="material-icons-round text-xl">add</span>
        </div>
        <span>Adicionar subtópico</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Nome do subtópico..."
            className={`w-full bg-white dark:bg-slate-950 border-2 ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'} rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all shadow-sm`}
            aria-invalid={!!error}
            aria-describedby={error ? "subtopic-error" : undefined}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            className="w-12 h-12 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 active:scale-90 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center"
            aria-label="Confirmar"
            title="Confirmar (Enter)"
          >
            <span className="material-icons-round text-2xl">check</span>
          </button>
          
          <button
            onClick={handleCollapse}
            className="w-12 h-12 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center"
            aria-label="Cancelar"
            title="Cancelar (Esc)"
          >
            <span className="material-icons-round text-2xl">close</span>
          </button>
        </div>
      </div>
      
      {error && (
        <span id="subtopic-error" className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2 ml-1 animate-in slide-in-from-left-2">
          <span className="material-icons-round text-sm">error</span> {error}
        </span>
      )}
      
      <div className="flex items-center gap-4 ml-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
          <span className="material-icons-round text-xs">keyboard</span>
          <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">Enter</kbd> salvar
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
          <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">Esc</kbd> cancelar
        </span>
      </div>
    </div>
  );
};

export default SubtopicAddForm;
