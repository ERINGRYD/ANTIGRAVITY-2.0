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
        className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all w-full md:w-auto"
        aria-expanded="false"
        aria-label="Adicionar novo subtópico"
      >
        <span className="material-icons-round text-lg group-hover:scale-110 transition-transform">add</span>
        <span>Adicionar subtópico</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2">
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
            placeholder="Nome do subtópico"
            className={`w-full bg-white dark:bg-slate-900 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm`}
            aria-invalid={!!error}
            aria-describedby={error ? "subtopic-error" : undefined}
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-sm"
          aria-label="Confirmar"
          title="Confirmar (Enter)"
        >
          <span className="material-icons-round text-lg">check</span>
        </button>
        
        <button
          onClick={handleCollapse}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          aria-label="Cancelar"
          title="Cancelar (Esc)"
        >
          <span className="material-icons-round text-lg">close</span>
        </button>
      </div>
      
      {error && (
        <span id="subtopic-error" className="text-xs font-medium text-red-500 flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
          <span className="material-icons-round text-[10px]">error</span> {error}
        </span>
      )}
      
      <span className="text-[10px] text-slate-400 ml-1">
        Pressione <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Enter</kbd> para salvar ou <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Esc</kbd> para cancelar
      </span>
    </div>
  );
};

export default SubtopicAddForm;
