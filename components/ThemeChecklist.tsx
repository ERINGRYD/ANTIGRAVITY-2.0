/**
 * ThemeChecklist Component
 * 
 * Manages the list of subtopics and theme-level completion logic.
 * 
 * Key Features:
 * - Re-evaluates theme completion after every subtopic update.
 * - Shows inline celebration when theme completes via checklist.
 * - Displays theme progress header (Goal vs Accumulated Time).
 */

import React, { useState, useEffect } from 'react';
import { Theme, Subtopic, isThemeCompleted } from '../types/theme.types';
import SubtopicRow from './SubtopicRow';

interface ThemeChecklistProps {
  theme: Theme;
  onSubtopicUpdate: (
    themeId: string, 
    subtopicId: string, 
    updates: Partial<Subtopic>
  ) => void;
  onThemeCompletionChange: (
    themeId: string, 
    isCompleted: boolean, 
    source: Theme['completionSource']
  ) => void;
}

const ThemeChecklist: React.FC<ThemeChecklistProps> = ({
  theme,
  onSubtopicUpdate,
  onThemeCompletionChange
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate Progress
  const completedSubtopics = theme.subtopics.filter(s => s.isCompleted).length;
  const totalSubtopics = theme.subtopics.length;
  const progressPercent = totalSubtopics > 0 
    ? Math.round((completedSubtopics / totalSubtopics) * 100) 
    : 0;

  // Handle Subtopic Updates & Re-evaluation
  const handleUpdate = (subtopicId: string, updates: Partial<Subtopic>) => {
    // 1. Optimistic Update (Local Scope for Check)
    const updatedSubtopics = theme.subtopics.map(s => 
      s.id === subtopicId ? { ...s, ...updates } : s
    );
    
    // 2. Check Theme Completion
    const updatedTheme = { ...theme, subtopics: updatedSubtopics };
    const isNowComplete = isThemeCompleted(updatedTheme);
    
    // 3. Trigger Parent Updates
    onSubtopicUpdate(theme.id, subtopicId, updates);

    // 4. Handle Theme Completion State Change
    if (isNowComplete && !theme.isCompleted) {
      onThemeCompletionChange(theme.id, true, 'checklist');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } else if (!isNowComplete && theme.isCompleted && theme.completionSource === 'checklist') {
      // Only revert if it was completed via checklist (not time or questions)
      onThemeCompletionChange(theme.id, false, null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4">
      
      {/* Theme Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Progress Bar Background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" 
          style={{ width: `${progressPercent}%` }} 
        />
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {theme.name}
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-sm">timer</span>
                Meta: {theme.goalTime} min
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-sm">history</span>
                Estudado: {theme.accumulatedTime} min
              </span>
            </div>
          </div>
          
          {/* Completion Badge */}
          {theme.isCompleted && (
            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 animate-in fade-in zoom-in duration-300">
              <span className="material-icons-round text-sm">check_circle</span>
              Concluído
            </div>
          )}
        </div>

        {/* Subtopic Progress Text */}
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {totalSubtopics === 0 
            ? "Sem subtópicos. O tema será concluído pelo tempo de estudo."
            : `${completedSubtopics} de ${totalSubtopics} subtópicos concluídos`
          }
        </div>

        {/* Inline Celebration Overlay */}
        {showCelebration && (
          <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg animate-in fade-in zoom-in duration-300 z-10">
            <span className="material-icons-round mr-2">celebration</span>
            Tema concluído!
          </div>
        )}
      </div>

      {/* Subtopics List */}
      <div className="flex flex-col gap-3">
        {theme.subtopics.map(subtopic => (
          <SubtopicRow
            key={subtopic.id}
            subtopic={subtopic}
            themeIsCompleted={theme.isCompleted}
            onMarkAsKnown={() => handleUpdate(subtopic.id, { 
              isCompleted: true, 
              completionSource: 'manual-known' 
            })}
            onMarkAsStudied={(id, isCompleted) => handleUpdate(id, { 
              isCompleted, 
              completionSource: isCompleted ? 'manual-study' : null 
            })}
            onUndoKnown={() => handleUpdate(subtopic.id, { 
              isCompleted: false, 
              completionSource: null 
            })}
          />
        ))}
      </div>

    </div>
  );
};

export default ThemeChecklist;
