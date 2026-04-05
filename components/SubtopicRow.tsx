/**
 * SubtopicRow Component
 * 
 * Handles the display and interaction for a single subtopic row.
 * 
 * Completion Sources & Visuals:
 * 1. 'manual-known': Muted, strikethrough, "Domínio prévio" label. No XP.
 * 2. 'manual-study': Standard checkmark, strikethrough. Awards XP (visual flash).
 * 3. 'questions': Lock icon, "Por questões" label. Read-only.
 */

import React, { useState, useEffect } from 'react';
import { Subtopic } from '../types/theme.types';

interface SubtopicRowProps {
  subtopic: Subtopic;
  themeIsCompleted: boolean;
  onMarkAsKnown: (subtopicId: string) => void;
  onMarkAsStudied: (subtopicId: string, isCompleted: boolean) => void;
  onUndoKnown: (subtopicId: string) => void;
}

const SubtopicRow: React.FC<SubtopicRowProps> = ({
  subtopic,
  themeIsCompleted,
  onMarkAsKnown,
  onMarkAsStudied,
  onUndoKnown
}) => {
  const [showXpFlash, setShowXpFlash] = useState(false);

  // Trigger XP flash only when completing via manual-study
  useEffect(() => {
    if (subtopic.isCompleted && subtopic.completionSource === 'manual-study') {
      setShowXpFlash(true);
      const timer = setTimeout(() => setShowXpFlash(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [subtopic.isCompleted, subtopic.completionSource]);

  const isKnown = subtopic.completionSource === 'manual-known';
  const isStudied = subtopic.completionSource === 'manual-study';
  const isQuestions = subtopic.completionSource === 'questions';
  const isDisabled = themeIsCompleted || isKnown || isQuestions;

  return (
    <div className={`
      group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
      ${isKnown 
        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/50 opacity-60' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'}
      ${themeIsCompleted ? 'opacity-70 pointer-events-none' : ''}
    `}>
      <div className="flex items-center gap-4 flex-1">
        {/* Checkbox (Study Trigger) - Styled like the completion button in Topic Card */}
        <div className="relative shrink-0">
          <button
            disabled={isDisabled}
            onClick={() => onMarkAsStudied(subtopic.id, !subtopic.isCompleted)}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2
              ${subtopic.isCompleted 
                ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20' 
                : isKnown
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : isQuestions
                    ? 'bg-amber-50 border-amber-200 text-amber-500 cursor-not-allowed'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
              }
            `}
          >
            <span className="material-icons-round text-xl">
              {isKnown ? 'check' : isQuestions ? 'lock' : subtopic.isCompleted ? 'check' : 'radio_button_unchecked'}
            </span>
          </button>
          
          {/* XP Flash Animation */}
          {showXpFlash && (
            <div className="absolute -top-8 -right-4 text-[10px] font-black text-amber-500 animate-bounce whitespace-nowrap pointer-events-none uppercase tracking-widest">
              +XP
            </div>
          )}
        </div>

        {/* Subtopic Name */}
        <div className="flex flex-col min-w-0">
          <span className={`
            text-sm font-bold transition-colors truncate
            ${subtopic.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through decoration-2' : 'text-slate-700 dark:text-slate-200'}
          `}>
            {subtopic.name}
          </span>
          
          {/* Source Labels */}
          {isKnown && (
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
              Domínio prévio
            </span>
          )}
          {isQuestions && (
            <span className="text-[9px] uppercase font-black text-amber-500 tracking-widest mt-0.5">
              Concluído por questões
            </span>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!subtopic.isCompleted && !themeIsCompleted && (
          <button
            onClick={() => onMarkAsKnown(subtopic.id)}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all active:scale-95"
          >
            Já domino
          </button>
        )}

        {isKnown && !themeIsCompleted && (
          <button
            onClick={() => onUndoKnown(subtopic.id)}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-all active:scale-95"
          >
            Desfazer
          </button>
        )}
      </div>
    </div>
  );
};

export default SubtopicRow;
