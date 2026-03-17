/**
 * SubjectCard Component
 * 
 * Handles 4 Visual States:
 * 1. Active: Current subject in cycle (Badge: "Em andamento")
 * 2. Cycle Completed: Rotation goal reached (Badge: "Meta atingida") - Temporary
 * 3. Pending: Waiting in cycle queue (No badge)
 * 4. Permanently Completed: All themes done (Badge: "Matéria concluída") - Permanent
 * 
 * Critical Distinction:
 * - State 2 (Cycle Completed) means the *time goal* for this rotation is met. It will return next rotation.
 * - State 4 (Permanently Completed) means *all content* is mastered. It leaves the cycle forever.
 */

import React from 'react';
import { Subject as LegacySubject } from '../types/storage.types';
import { SubjectCycleState } from '../types/subjectCycle.types';
import { Theme } from '../types/theme.types';

// Extend the legacy subject to support new fields if they exist, or just use it as is
type Subject = LegacySubject;

interface SubjectCardProps {
  subject: Subject;
  cycleState?: SubjectCycleState;
  themes?: Theme[];
  isActive: boolean;
  cardIndex?: number;
  isPermanentlyCompleted?: boolean;
  onPress?: () => void;
  // Legacy props support
  onClick?: (id: string) => void;
  onPlay?: (id: string) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isEditMode?: boolean;
}

const CircularProgress: React.FC<{ 
  percentage: number; 
  color: string; 
  size?: number; 
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}> = ({ percentage, color, size = 80, strokeWidth = 8, label, subLabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
          {Math.round(percentage)}%
        </span>
        {subLabel && (
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  cycleState,
  themes,
  isActive,
  cardIndex = 0,
  isPermanentlyCompleted,
  onPress,
  onClick,
  onPlay,
  draggable,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
  isEditMode
}) => {
  // 1. Derive Themes (Fallback to topics if themes not provided)
  const effectiveThemes: Theme[] = themes || (subject.topics ? subject.topics.map(t => ({
    id: t.id,
    subjectId: subject.id,
    name: t.name,
    order: 0,
    goalTime: t.totalMinutes,
    accumulatedTime: t.studiedMinutes,
    isCompleted: t.isCompleted,
    completionSource: null,
    subtopics: [],
    createdAt: '',
    updatedAt: ''
  })) : []);

  // 2. Derive Cycle State (Fallback to subject stats if not provided)
  const effectiveCycleState: SubjectCycleState = cycleState || {
    subjectId: subject.id,
    currentCycleTime: subject.studiedMinutes,
    cycleGoalTime: subject.totalMinutes,
    excessTime: Math.max(0, subject.studiedMinutes - subject.totalMinutes),
    isRotationCompleted: subject.studiedMinutes >= subject.totalMinutes,
    rotationIndex: 1,
    activeThemeId: null,
    startedAt: null,
    completedAt: null
  };

  // 3. Compute Derived Values
  const completedThemesCount = effectiveThemes.filter(t => t.isCompleted).length;
  const totalThemesCount = effectiveThemes.length;
  const contentProgressPercent = totalThemesCount > 0 
    ? Math.round((completedThemesCount / totalThemesCount) * 100) 
    : 0;

  const cycleProgressPercent = effectiveCycleState.cycleGoalTime > 0 
    ? Math.round(Math.min(100, (effectiveCycleState.currentCycleTime / effectiveCycleState.cycleGoalTime) * 100))
    : 0;
    
  const isRotationCompleted = effectiveCycleState.isRotationCompleted;
  
  // Determine if permanently completed (if not explicitly passed)
  const isPermanent = isPermanentlyCompleted ?? (totalThemesCount > 0 && completedThemesCount === totalThemesCount);

  // 4. Determine Visual State
  const isState4 = isPermanent;
  const isState2 = !isState4 && isRotationCompleted;
  const isState1 = !isState4 && !isState2 && isActive;
  // State 3 is implicit (default)

  // 5. Handle Interactions
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick(subject.id);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) onPlay(subject.id);
  };

  // Base Card Style - Matching BattleView Design System
  // rounded-[28px], border-l-[8px], shadow-sm, generous padding
  const baseClasses = "relative w-full p-6 md:p-8 rounded-[28px] transition-all duration-300 border border-slate-100 dark:border-slate-800 border-l-[8px] flex flex-col justify-between group select-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md";
  
  let stateClasses = "";
  if (isState4) {
    stateClasses = "opacity-60 grayscale cursor-default";
  } else if (isState2) {
    stateClasses = "cursor-pointer";
  } else if (isState1) {
    stateClasses = "scale-[1.01] shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer";
  } else {
    // State 3 (Pending)
    stateClasses = "cursor-pointer hover:scale-[1.01]";
  }

  // Drag Styles
  if (isDragging) stateClasses += " opacity-50 scale-95 border-dashed border-blue-400";
  if (isDropTarget) stateClasses += " border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105";

  return (
    <div 
      onClick={!isState4 || isEditMode ? handleClick : undefined}
      className={`${baseClasses} ${stateClasses}`}
      style={{ borderLeftColor: subject.color }}
      draggable={draggable && !isState4}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {isState4 ? 'CONCLUÍDA' : `MATÉRIA ${cardIndex + 1}`}
            </span>
            {isEditMode && !isState4 && (
              <span className="material-icons-round text-sm text-slate-300">drag_handle</span>
            )}
          </div>
          <h3 className={`text-xl font-black tracking-tight leading-tight ${isState4 ? 'text-slate-500 dark:text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
            {subject.name}
          </h3>
        </div>

        {/* Action / Status Icons */}
        <div className="flex items-center gap-2">
          {isState1 && !isEditMode && (
            <button 
              onClick={handlePlay}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
            >
              <span className="material-icons-round text-xl">play_arrow</span>
            </button>
          )}
          
          {isState2 && (
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-icons-round text-lg">check</span>
            </div>
          )}
        </div>
      </div>

      {/* Content & Cycle Progress Row */}
      <div className="flex items-end justify-between gap-4">
        
        {/* Left Side: Content Progress (Linear) */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              Conteúdo
            </span>
            <span className="text-[10px] font-black text-slate-900 dark:text-white">
              {completedThemesCount}/{totalThemesCount}
            </span>
          </div>
          
          <div className="h-3 w-full bg-[#F1F3F5] dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${isState4 ? 'bg-slate-400' : ''}`}
              style={{ 
                width: `${contentProgressPercent}%`, 
                backgroundColor: isState4 ? undefined : subject.color 
              }}
            />
          </div>
          
          {isState4 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Finalizado
            </span>
          )}
        </div>

        {/* Right Side: Cycle Progress (Circular) - Only if not permanently completed */}
        {!isState4 && (
          <div className="flex flex-col items-center gap-1 pl-2 border-l border-slate-100 dark:border-slate-800">
             <CircularProgress 
               percentage={cycleProgressPercent} 
               color={subject.color} 
               size={64} 
               strokeWidth={6}
               subLabel="CICLO"
             />
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
               {effectiveCycleState.currentCycleTime} min
             </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubjectCard;

