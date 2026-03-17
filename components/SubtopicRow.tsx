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
      group flex items-center justify-between p-3 rounded-xl border transition-all
      ${isKnown ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
      ${themeIsCompleted ? 'opacity-70 pointer-events-none' : ''}
    `}>
      <div className="flex items-center gap-3 flex-1">
        {/* Checkbox (Study Trigger) */}
        <div className="relative">
          <input
            type="checkbox"
            checked={subtopic.isCompleted}
            disabled={isDisabled}
            onChange={(e) => onMarkAsStudied(subtopic.id, e.target.checked)}
            className={`
              appearance-none w-5 h-5 rounded-md border-2 transition-all cursor-pointer
              ${isKnown 
                ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed' 
                : isQuestions
                  ? 'border-amber-300 bg-amber-50 text-amber-500 cursor-not-allowed'
                  : 'border-slate-300 dark:border-slate-600 checked:bg-blue-500 checked:border-blue-500'
              }
            `}
          />
          {/* Custom Checkmark Icons */}
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-white">
            {isKnown && <span className="material-icons-round text-sm text-slate-400">check</span>}
            {isQuestions && <span className="material-icons-round text-sm text-amber-500">lock</span>}
            {isStudied && <span className="material-icons-round text-sm">check</span>}
          </span>
          
          {/* XP Flash Animation */}
          {showXpFlash && (
            <div className="absolute -top-6 -right-6 text-xs font-bold text-amber-500 animate-bounce whitespace-nowrap pointer-events-none">
              +XP
            </div>
          )}
        </div>

        {/* Subtopic Name */}
        <div className="flex flex-col">
          <span className={`
            text-sm font-medium transition-colors
            ${subtopic.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}
          `}>
            {subtopic.name}
          </span>
          
          {/* Source Labels */}
          {isKnown && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
              Domínio prévio
            </span>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {!subtopic.isCompleted && !themeIsCompleted && (
          <button
            onClick={() => onMarkAsKnown(subtopic.id)}
            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Já domino
          </button>
        )}

        {isKnown && !themeIsCompleted && (
          <button
            onClick={() => onUndoKnown(subtopic.id)}
            className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500 transition-all"
          >
            Desfazer
          </button>
        )}

        {isQuestions && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
            <span className="material-icons-round text-[10px] text-amber-500">lock</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
              Por questões
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtopicRow;
