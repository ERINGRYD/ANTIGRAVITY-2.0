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
  subjectColor: string;
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
  subjectColor,
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

  const formatTime = (minutes: number) => {
    const mins = minutes || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-4">
      
      {/* Theme Header - Updated to match Topic Card design */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-5">
            {/* Icon Box matching Topic Card */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
              style={{ backgroundColor: subjectColor }}
            >
              <span className="material-icons-round text-3xl">
                {/* We don't have the icon in Theme, but we can use a default or pass it */}
                {/* For now, let's assume it's available or use a generic one */}
                {/* Actually, TopicDetailView has the icon. I should pass it too or just use a book icon */}
                menu_book
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                {theme.name}
              </h2>
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">timer</span>
                  Meta: {formatTime(theme.goalTime)}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                <span className="flex items-center gap-1.5">
                  <span className="material-icons-round text-sm">history</span>
                  Estudado: {formatTime(theme.accumulatedTime)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Completion Badge */}
          {theme.isCompleted && (
            <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in zoom-in duration-300 shadow-sm">
              <span className="material-icons-round text-sm">check_circle</span>
              Concluído
            </div>
          )}
        </div>

        {/* Progress Section matching Topic Card */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span 
              className="text-lg font-black"
              style={{ color: theme.isCompleted ? '#10B981' : subjectColor }}
            >
              {progressPercent}%
            </span>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              {formatTime(theme.accumulatedTime)} / {formatTime(theme.goalTime)}
            </span>
          </div>
          <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-800">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: theme.isCompleted ? '#10B981' : subjectColor
              }} 
            />
          </div>
        </div>

        {/* Subtopic Progress Text */}
        <div className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="material-icons-round text-sm opacity-50">
            {totalSubtopics === 0 ? 'info' : 'list_alt'}
          </span>
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
